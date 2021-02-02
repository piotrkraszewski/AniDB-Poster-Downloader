const { DownloaderHelper } = require('node-downloader-helper')

export default async function downloadPoster(url, downloadFolder){
  try{
    const dl = new DownloaderHelper(url, downloadFolder, {
      fileName: 'poster.jpg' 
    })
    dl.on('end', () => console.log('Download Completed'))
    dl.start()
    return undefined
  } catch(error) {
    // console.log(error.message)
    return error.message
  }
}