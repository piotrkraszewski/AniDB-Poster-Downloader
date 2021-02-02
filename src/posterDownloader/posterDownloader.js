import React, {useState, useEffect} from 'react'
import {ipcRenderer, shell, dialog} from 'electron'
import { FileDrop } from 'react-file-drop'
import useInput from '../hooks/useInput'
import CrossfadeImage from '../hooks/CrossfadeImage'
import { motion, AnimatePresence } from "framer-motion"
import { useAlert } from "react-alert";
import rename from '../utilities/renameFunc.js'
import downloadPoster from '../utilities/downloadFileFunc.js'
import LoginModal from './modals/LoginModal'
import AboutLogin from './modals/AboutLogin'
import ConfirmModal from './modals/ClearCacheConfirmModal'
import FirstTimeLoginModal from './modals/FirstTimeLoginModal'
import FirstTimeAutoLoginModal from './modals/FirstTimeAutoLoginModal'
import no_image from '../images/no_image.png'
import chrome_image from '../images/chrome.png'
import folder_image from '../images/folder.png'
import login_icon from '../images/login.png'
import refresh_icon from '../images/refresh.svg'
import path from 'path'
import storage from 'electron-storage'

// global const
const searchUrlStart = 'https://anidb.net/perl-bin/animedb.pl?adb.search='
const searchUrlEnd = '&show=animelist&do.search=1'


export default function posterDownloader() {
  const [search, setSearch, changeSearch, resetSearch] = useInput('')
  const [download, setDownload, changeDownload, resetDownload] = useInput('')
  const [selectedAnime, setSelectedAnime] = useState({ posterUrl: no_image })
  const [animeData, setAnimeData] = useState([{}])
  const [isLoading, setIsLoading] = useState(false)

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isAboutLoginOpen, setIsAboutLoginOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [islogged, setIslogged] = useState(false)
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false)
  const [firstTimeLoginMsg, setFirstTimeLoginMsg] = useState(false)
  const [isFirstTimeAutoLogin, setIsFirstTimeAutoLogin] = useState(false)
  const [firstTimeAutoLoginMsg, setFirstTimeAutoLoginMsg] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const alert = useAlert()
  const storagePath = './AniDB Poster Downloader/LoginData.json'

  // on App loaded - fetching login and password
  useEffect(async () => { 
    try{
      const data = await storage.get(storagePath)
      setLogin(data.Login)
      setPassword(data.Password)
      setIsFirstTimeLogin(data.isFirstTimeLogin)
      setIsFirstTimeAutoLogin(data.isFirstTimeAutoLogin)
    } catch(err){
        console.error(err)
    }
  },[])

  // save user login and password 
  const saveUserData = async (login, password) =>{
  try{
    await storage.set(storagePath, 
    { Login: login, Password: password, IsFirstTimeLogin: false, isFirstTimeAutoLogin: false }
    )
    ipcRenderer.send('updateUserData', login, password)

    alert.success(`Saved Login: ${login}, Password: ${password}`)
    } catch (err) {
      console.log(err)
    }
  }

  const clearUserData = async () => {
    try{
      await storage.set(storagePath, 
        { Login: '', Password: '', IsFirstTimeLogin: true,isFirstTimeAutoLogin: true })
      await storage.set('./AniDB Poster Downloader/cookies.json', [{}])
      ipcRenderer.send('clearCookies')
      setLogin('')
      setPassword('')
      setIslogged(false)
      setIsConfirmModalOpen(false)
      setIsLoginModalOpen(false)
      setIsFirstTimeLogin(true)
      setIsFirstTimeAutoLogin(true)
      alert.success('Cleared your login, password and cookies')
      } catch (err) {
        console.log(err)
        alert.error('Failed to clear your login, password and cookies')
      }
  }

  ipcRenderer.once('loginStatus', (e, loginStatus) => {
    console.log('loginStatus', loginStatus)
    if(loginStatus === 'ERR_CONNECTION_REFUSED')
      alert.error("Can't connect to AniDB on startup")
    else
      setIslogged(loginStatus)
  })

  const loginUser = async (login, password) =>{
    if(isFirstTimeLogin){
      setFirstTimeLoginMsg(true)
      setIsFirstTimeLogin(false)
    } else {
      await saveUserData(login, password)
      ipcRenderer.send('loginUser');
      ipcRenderer.once('loginUserRes', (e, isLoggedIn) => {
        setIslogged(isLoggedIn)
        if(isLoggedIn){
          alert.success('Successfuly logged in')
          setIsLoginModalOpen(false)
          setIsFirstTimeAutoLogin(false)
        } else{
          alert.error('Failed to login')
        }
      })
    }
  }

  const proceedToLoginUser = () => {
    setFirstTimeLoginMsg(false)
    loginUser(login, password)
  }

  const proceedToAutoLoginUser = () => {
    setFirstTimeAutoLoginMsg(false)
    searchAnime(search)
  }


  // ===== other App functions =====
  const onDrop = (files, e) => {
    e.preventDefault()
    const fileData = e.dataTransfer.files[0] 
    const extName = path.extname(fileData.path)
    let downloadPath = fileData.path

    // changes downloadPath if drag file inseat of folder
    if(extName !== '')
      downloadPath = path.dirname(downloadPath)

    let searchName = path.basename(fileData.path, extName) // cuts 'ext'
    searchName = rename(searchName)
    
    searchAnime(searchName)
    setSearch(searchName) 
    setDownload(downloadPath)
  }

  const onSearchInBrowser = () => {
    search.length >= 3 
    ? shell.openExternal(searchUrlStart + search + searchUrlEnd) 
    : alert.info('Enter at least 3 characters to search')
  }

  const bigImgClick = () => {
    selectedAnime.pageUrl !== undefined
    ? shell.openExternal(selectedAnime.pageUrl) 
    : ''
  }

  const onClickSearch = () => {
    searchAnime(search)
  }

  const selectPathInExplorer = () => {
    ipcRenderer.send('selectPathInExplorer');
    ipcRenderer.once('newDownloadPath', (e, downloadPath) => {
      setDownload(downloadPath)
    })
  }

  const onDownload = async () => {
    const isDownloadError = await downloadPoster(selectedAnime.posterUrl, download)

    if(isDownloadError)
      alert.error(isDownloadError)
    else 
      alert.success('download finished')
  }

  const searchAnime = (searchName) => {
    if(isFirstTimeAutoLogin && login !== '' & password !== ''){
      setFirstTimeAutoLoginMsg(true)
      setIsFirstTimeAutoLogin(false)
    } else {
      if(searchName.length >= 3){
        // sends msg to electron
        ipcRenderer.send('scrapePosters', searchUrlStart + searchName + searchUrlEnd)
  
        setIsLoading(true)
        
        // waits for electron response
        ipcRenderer.once('scrapeResArr', (e, resArr, error_msg, isLoggedIn, outLogin_msg, outDidTryLogin, outIsIpBlocked) => {
          if(!outIsIpBlocked){
            setIslogged(isLoggedIn)
            if(outLogin_msg !== '') alert.success(outLogin_msg)
            if(outDidTryLogin) {
              alert.error('Failed to automatically login')
              alert.info('If you want to stop automatic login clear login data or provide correct login and password')
            }
            if(error_msg === ''){
              if (resArr.length > 0){
                // if search return any result
                setAnimeData(resArr)
                setSelectedAnime(resArr[0])
              } else {
                if(islogged){
                  alert.info('No anime found')
                } else {
                  alert.info("No anime found. Remember for not logged users restricted content shows as no results")
                }
              }
            } else {
              alert.info(error_msg)
            }
          } else {
            alert.error('Your IP is blocked. Try again later')
            alert.info('It usually happens when you try to login a lot and fail. You should be unblock within 5min')
          }
          setIsLoading(false)
        })
      } else {
        alert.info('Enter at least 3 characters to search')
      }
    }
  }

  const selectPoster = e => {setSelectedAnime(animeData[e])}
  const openLogin = e => {setIsLoginModalOpen(true)}

  const refresh = e => {
    setAnimeData([])
    setSelectedAnime({ posterUrl: no_image })
    setSearch('')
    setDownload('')
  }

  // refresh shorcut setup F5 and ctrl+r
  ipcRenderer.once('refresh', (e) => {
    refresh()
  })


  const enterPressed = e => {
    var code = e.keyCode || e.which
    if (code === 13) {
      e.preventDefault() // disables enter key 
      onClickSearch()
    }
  }
  
  useEffect( () => {
    console.log(isFirstTimeLogin)
  },[isFirstTimeLogin])

  
  //=====================================
  return (
  <div>
    <div className='top-app'>
      <button 
        className='btn btn-dark refresh-btn'
        data-tooltip='Refresh'
        onClick={refresh}  
      >
        <img src={refresh_icon} className='refresh-icon'/>
      </button>
      <button 
        className={'btn btn-dark login-btn ' + (islogged ? 'logged' : '')}
        data-tooltip='Login'
        onClick={openLogin}  
      >
        <img src={login_icon} className='login-icon'/>
      </button>
    </div> 

    <div id="container">
      <div id="left-side">

        <FileDrop onDrop={(files, e) => onDrop(files, e)}>
          <p id="text-drag-file">Drag File/Folder Here or Search manually bellow</p>
        </FileDrop>

        <h5>Search Anime</h5>
        <div className="textarea-button-container">
          <textarea 
            className="form-control my-text-area"
            spellcheck="false" 
            value={search} 
            onChange={changeSearch}
            onKeyPress={enterPressed}>
          </textarea>
          <button 
            className="btn btn-dark small-right-btn"
            data-tooltip="Search manually in chrome"
            onClick={onSearchInBrowser}
          > 
            <img className='button-image' src={chrome_image} />
          </button>
        </div>
        <div className="text-center">
          <button 
            id="btn-search" 
            className="btn btn-primary"
            onClick={onClickSearch}
            >
              Search
          </button>
        </div>

        <h5>Download path</h5>
        <div className="text-center">
        <div className="textarea-button-container">
          <textarea
            className="form-control my-text-area" 
            spellcheck="false"
            value={download} 
            onChange={changeDownload}>
          </textarea>
          <button 
            className="btn btn-dark small-right-btn"
            data-tooltip="Select path in expolorer"
            onClick={selectPathInExplorer}
            > 
            <img className='button-image' src={folder_image} />
          </button>
        </div>
          <button id="btn-download" className="btn btn-success" onClick={onDownload}>Download</button>
        </div>
      </div>

      <div id="right-site">
        <div 
        className={isLoading && "lds-ellipsis"}
          style={{opacity: (isLoading ? '0.8' : '0')}}
        >
        <div></div><div></div><div></div><div></div></div>

        <div id='big-img' onClick={bigImgClick}>
          <CrossfadeImage
            style={{
              height: '380px', 
              minWidth: '270px',
              width: '270px',
              borderRadius: '10px',
              boxShadow: '2px 2px 15px rgba(0, 0, 0, 0.6)',
              backgroundColor: 'rgb(48, 48, 48)',
              marginBottom: '3px',
              cursor: (selectedAnime.posterUrl !== no_image && 'pointer'),
              opacity: (isLoading ? '0.4' : '1')
            }}
            src={selectedAnime.posterUrl}
          />
        </div>

        {selectedAnime.posterUrl !== no_image
        ? <p className="message">click to open anime page in browser</p>
        : <p></p>}

        <p id="first-title"><b>First Title:</b> {selectedAnime.firstTitle}</p>

        {selectedAnime.secondTitle
        ? <p id="second-title"><b>Second Title:</b> {selectedAnime.secondTitle}</p>
        : <div></div>}
        
      </div>
    </div>

    <div className="search-res">
      {<AnimatePresence exitBeforeEnter>
        {animeData.map((val, i) => (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1}}
            exit={{ opacity: 0 }}

            // no_image is to hide warning 
            key={val.posterUrl ? val.posterUrl : 'no_image'} 
            className="one-res" 
            onClick={() => selectPoster(i)}
          >      
            <img 
              className={animeData.length > 1 ? 'small-img' : 'hide'} 
              src={val.posterUrl}
            /> 
            <p className={animeData.length > 1 ? 'small-text' : 'hide'}>
              {val.firstTitle}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>}
    </div>

    <LoginModal 
      open={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
      onOpenAbout={() => setIsAboutLoginOpen(true)}
      onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
      login={login}
      onLoginChange={val => setLogin(val)}
      password={password}
      islogged={islogged}
      onPasswordChange={val => setPassword(val)}
      loginUser={() => loginUser(login, password)}
    />

    <AboutLogin 
      open={isAboutLoginOpen} 
      onClose={() => setIsAboutLoginOpen(false)} 
    /> 

    <ConfirmModal 
      open={isConfirmModalOpen} 
      onClose={() => setIsConfirmModalOpen(false)} 
      clearUserData={() => clearUserData()} 
    /> 
    <FirstTimeLoginModal
      open={firstTimeLoginMsg} 
      onClose={() => {
        setFirstTimeLoginMsg(false)
        setIsFirstTimeLogin(true)
      }} 
      proceedToLoginUser={() => proceedToLoginUser()}
    />
    <FirstTimeAutoLoginModal
      open={firstTimeAutoLoginMsg} 
      onClose={() => {
        setFirstTimeAutoLoginMsg(false)
        setIsFirstTimeAutoLogin(true)
      }} 
      proceedToLoginUser={() => proceedToAutoLoginUser()}
    />
  </div>
  )}