import puppeteer from 'puppeteer'
import storage from 'electron-storage'

// state variables
let username = ''
let password = ''
let browser
let page
let isLoggedIn
let didTryLogin = false
let isIpBlocked = false
let login_msg = ''
let cookies
const cookiesPath = './AniDB Poster Downloader/cookies.json'


export async function startBrowser() {
  // fetching login and password from file
  const storagePath = './AniDB Poster Downloader/LoginData.json'
  try{
    const data = await storage.get(storagePath)
    username = data.Login
    password = data.Password
    console.log('Login and password fetched')
  } catch(err){
    try{
      await storage.set(storagePath, 
        { Login: '', Password: '', IsFirstTimeLogin: true, isFirstTimeAutoLogin: true })
    } catch(err){
      console.error(err)
    }
  }


  browser = await setBrowserSettings(true)
  page = await browser.newPage()
  console.log('browser started')


  try{
    cookies = await storage.get(cookiesPath)
    await page.setCookie(...cookies) // set cookies from file
    console.log('cookies fetched')
  } catch(err){
    console.error(err)
    try{
      await storage.set(cookiesPath, [{}])
    } catch(err){
      console.error(err)
    }
  }
  

  // == checks if logged in ==
  try{
    await page.goto('https://anidb.net/anime/?adb.search=beastars&do.search=1')
  } catch(err){
    // if can't connect to aniDB
    console.log('AniDB is down')
    return 'ERR_CONNECTION_REFUSED'
  }

  try{
    const [login_button] = await page.$x('//*[@id="user-xauth"]/span/button')
    if(login_button !== undefined){
      console.log('not logged in')
      isLoggedIn = false
      return false
    } else{
      console.log('logged in')
      isLoggedIn = true
      return true
    }
  } catch(err){
    console.error(err)
  }
}


export async function scrapeAnimeData(searchUrl) {
  let outLogin_msg
  let outDidTryLogin
  let outIsIpBlocked

  // when cookies are invalid, login
  [page, isLoggedIn, login_msg] = await Login(searchUrl, page, browser)


  // if we have any img result on normal search page and user is logged in
  const [small_img_logged] = await page.$x('html/body/div[2]/div[2]/div[2]/div/div[2]/div[2]/form/table/tbody/tr[1]/td[3]/a/picture/img')

  // if we have any img result on normal search page and user isn't logged in
  const [small_img_not_logged] = await page.$x('/html/body/div[3]/div[2]/div[2]/div/div[2]/div[2]/table/tbody/tr[1]/td[2]/a/picture/img')

  // if big_image is preset then we are on main anime page no search page
  const [big_image] = await page.$x('//*[@id="layout-main"]/div[2]/div[1]/div[2]/div[1]/div/picture/img')

  // if we encounterd restricted content
  const [restricted_content] = await page.$x('html/body/div[3]/div/div[1]/div/div/u')
  
  let resArray = []
  let error_msg = ''
  if(small_img_logged !== undefined){
    resArray = await scrapeSearchPage(page, isLoggedIn)
  }else if(small_img_not_logged !== undefined){
    resArray = await scrapeSearchPage(page, isLoggedIn)
  }else if(big_image !== undefined){
    resArray = await scrapeMainAnimePage(page)
  }else if(restricted_content !== undefined){
    resArray = []
    error_msg = 'Restricted content. Please log in to access'
  }
  console.log(resArray)

  outLogin_msg = login_msg
  login_msg = ''
  outDidTryLogin = didTryLogin
  didTryLogin = false
  outIsIpBlocked = isIpBlocked
  isIpBlocked = false
  return [resArray, error_msg, isLoggedIn, outLogin_msg, outDidTryLogin, outIsIpBlocked]
}



// =====================
async function scrapeSearchPage(page, isLoggedIn){
  let dataArray = []
  const numOfWantedResults = 10

  for (let i=1; i <= numOfWantedResults; i++){
    let xPathBase
    let posterXPath
    let pageXPath
    let firstTitleXPath
    let secondTitleXPath
    
    if(isLoggedIn){
       xPathBase = 'html/body/div[2]/div[2]/div[2]/div/div[2]/div[2]/form/table/tbody/tr[' + i
       posterXPath = xPathBase + ']/td[3]/a/picture/img'
       pageXPath = xPathBase + ']/td[4]/a'
       firstTitleXPath = xPathBase + ']/td[4]/a'
       secondTitleXPath = xPathBase + ']/td[4]/span[1]'
    } else {
      // if user isn't logged
       xPathBase = 'html/body/div[3]/div[2]/div[2]/div/div[2]/div[2]/table/tbody/tr[' + i
       posterXPath = xPathBase + ']/td[2]/a/picture/img'
       pageXPath = xPathBase + ']/td[3]/a'
       firstTitleXPath = xPathBase + ']/td[3]/a'
       secondTitleXPath = xPathBase + ']/td[3]/span[1]'
    }
    

    const res = await scrapeOneAnime(posterXPath, pageXPath, firstTitleXPath, secondTitleXPath, page)
    if(res.posterUrl === '' && res.firstTitle === ''){
      // if poster not found
      return dataArray
    }
    dataArray.push(res)
  }
  return dataArray
}

async function scrapeMainAnimePage(page){
  console.log('Scraping main page')
  const posterXPath = '//*[@id="layout-main"]/div[2]/div[1]/div[2]/div[1]/div/picture/img'
  const pageXPath = '//*[@id="tab_1_pane"]/div/table/tbody/tr[1]/td/a'
  const firstTitleXPath = '//*[@id="layout-main"]/h1'
  const secondTitleXPath = '//*[@id="tab_2_pane"]/div/table/tbody/tr[3]/td/label'

  // can't make this syntax smaller
  let dataArray = []
  dataArray.push(await scrapeOneAnime(posterXPath, pageXPath, firstTitleXPath, secondTitleXPath, page))
  return dataArray
}

async function scrapeOneAnime(posterXPath, pageXPath, firstTitleXPath, secondTitleXPath, page){
  const posterUrl = await findPoster(posterXPath, page)
  const pageUrl = await findPageUrl(pageXPath, page)
  const firstTitle = await findFirstTitle(firstTitleXPath, page)
  const secondTitle = await findSecondTitle(secondTitleXPath, page)
  return {posterUrl, pageUrl, firstTitle, secondTitle}
}

async function findPoster(XPath, page){
  let posterUrl = await findElementOnPage(XPath, 'src', page)
  posterUrl = posterUrl.replace('65', 'main').replace('-thumb.jpg', '')
  return returnScrapedElement(posterUrl)
}


async function findPageUrl(XPath, page){
  const urlNumber = await findElementOnPage(XPath, 'href', page)
  return returnScrapedElement(urlNumber)
}

async function findFirstTitle(XPath, page){
  let title = await findElementOnPage(XPath, 'innerText', page)
  title = title.replace('Anime: ', '')
  return returnScrapedElement(title)
}

async function findSecondTitle(XPath, page){
  let title = await findElementOnPage(XPath, 'innerText', page)
  title = title.replace('(', '').replace(')', '')
  return returnScrapedElement(title)
}

function returnScrapedElement(element){
  if(element !== '')
    return element
  else
    return ''
}

async function findElementOnPage(XPath, propType, page){
  const [el] = await page.$x(XPath)
  if(el !== undefined){
    const element = await el.getProperty(propType)
    return String(await element.jsonValue())
  } else {
    return ''
  }
}

async function checkIsIpBlocked(isIpBlocked, page){
  // Check if user's IP is not blocked
  const [is_IP_blocked] = await page.$x('html/body/div[3]/div/div[1]/div/div')

  // element for IP block and restrited content is the same so we have to check inner text
  if (is_IP_blocked !== undefined){
    const is_IP_blocked_txt = await is_IP_blocked.getProperty('innerText')
    const is_IP_blocked_Str = String(await is_IP_blocked_txt.jsonValue())
    console.log(is_IP_blocked_Str)
    if(is_IP_blocked_Str.includes('denied')){
      return true
    }
  }
  return false
}

async function Login(searchUrl, page, browser){
  didTryLogin = false
  isIpBlocked = false
  login_msg = ''
  await page.goto(searchUrl)

  isIpBlocked = await checkIsIpBlocked(isIpBlocked, page)

  // If IP is not blocked
  if (!isIpBlocked){

    // Check if user is logged in (if login_button is present)
    const [login_button] = await page.$x('//*[@id="user-xauth"]/span/button')

    // If not logged, 
    if (login_button !== undefined){
      isLoggedIn = false

      // and provided password opens browser on top of the app
      if (username !== '' && password !== ''){
        didTryLogin = true
        browser.close()
        browser = await setBrowserSettings(false)
    
        
        page = await browser.newPage()
        await page.goto(searchUrl)
        await page.type('#user-xname > span > input', username, {delay: 30})
        await page.type('#user-xpass > span > input', password, {delay: 30})
        await page.click('#user-xauth > span > button')

        await delay(200)  // seems necessary to avoid error sometimes
        // does login failed
        isIpBlocked = await checkIsIpBlocked(isIpBlocked, page)
        const [error] = await page.$x('html/body/div[3]/div/div[1]/div[2]/div/a[1]')
        if(error !== undefined || isIpBlocked){// found error
          console.log('login failed')
          isLoggedIn = false
          login_msg = ''
        } else {
          console.log('login successful')
          isLoggedIn = true
          login_msg = 'successful automatic login'
          await delay(1000) // wait for cookies to save in chrome  
    
          cookies = await page.cookies()
          try{
            await storage.set(cookiesPath, [...cookies])
          } catch(err){
            console.error(err)
          }
        }
        
        
        // close browser and opens it again in background
        await browser.close()
        browser = await setBrowserSettings(true)
        page = await browser.newPage()

        // sets cookies only if login was successful
        if(error === undefined && !isIpBlocked){ await page.setCookie(...cookies) }

        await page.goto(searchUrl)
      }
    }
  } 

  return [page, isLoggedIn, login_msg, didTryLogin, isIpBlocked]
} 


async function setBrowserSettings(isHeadless){
  // check in what mode we are in and pasess correct path to pupeteer
  let options = {}
  if(__dirname.includes('resources')) // if production mode
    options = {
      // path to chrome installed  with app in resource folder 
      executablePath: __dirname.replace('app.asar', 'node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe')
    }

  browser = await puppeteer.launch({
    headless: isHeadless, 
    defaultViewport: null,
    ...options
    // executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  })
  return browser
}


export async function onlyLogin() {
  // Beastars has only 2 search resluts so it loads faster
  [page, isLoggedIn] = await Login('https://anidb.net/anime/?adb.search=beastars&do.search=1', page, browser)

  return isLoggedIn
}

export async function clearCookies() {
  username = ''
  password = ''
  await page.deleteCookie(...cookies)
}


export async function updateUserData(newLogin, newPassword){
  username = newLogin
  password = newPassword
  console.log(username);
  console.log(password);
}


function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}
