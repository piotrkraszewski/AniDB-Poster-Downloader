export default function rename(fileName){
  fileName = fileName.replace(' - (1080p)', '')
  fileName = fileName.replace(' - (2160p)', '')
  fileName = fileName.replace(' - (720p)', '')

  fileName = fileName.replace('(1080p)', '')
  fileName = fileName.replace('(2160p)', '')
  fileName = fileName.replace('(720p)', '')

  fileName = fileName.replace('EX', '')
  fileName = fileName.replace('NE', '')
  fileName = fileName.replace('LQ', '')
  fileName = fileName.replace('V2', '')

  for (let step = 0; step <= 9; step++) {
    let toReplaceStr = " - 0" + step
    fileName = fileName.replace(toReplaceStr, '')
  }
  
  return fileName
}