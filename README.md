# AniDB Poster Downloader

## Description:

Electron application that allows you to quickly download poster for your anime. Developed mainly for people running media servers (Plex, Emby) or other software, that displays anime collection stored on hard drive using posters. Many of those programs support identifying a show and downloading a poster for it, but in case of an anime, results are not perfect. Program supports drag and drop functionality that allows user to quickly drop a folder with anime to it and download poster to this folder.

## Basic usage:
1. You can search anime poster by typing in "Search Anime" textarea and then clicking search or pressing "enter" key. Then you can choose folder to which you want to downlad poster.

<img src="https://lh3.googleusercontent.com/-ueiy9MskZt8pbqgSMNIK97lg6QIC9Be5jvK_l94ZgijJT0AcTllF6-6tBHXmsINhGb0RR6OJVQ5wqAo3-xWR3MxmsHLetmQsyvPp7vWwau8roa-WGftgCmemhgC4KGKEHDcwMRDCg27digVV1mYWMxWHiFPHdmWMEb_GOBRO_uPvXIyATJ9W3Ki26fiqFoMQufW-9Di_Q6BzdSY2a9EJeNlfc6UTOPpyv5G0iyo0nYHsbl-3s7VBc2rkzog4yilx1xcwuw2q3g0Uua8RDtXzLPNxGdcvQhjc9CYCo7duZqEcqHOA4JRuyzjDOQQW71NQDt3sVQCaFQX05hcbNy6ci6K9PHnS_4SRtIeSiSOvrEP7yGyZVbyFv5ZmCX6tUgrGFGD4weLrevGEgCZqjqDiUJeFvQXbHW532AiWMOjj7hRRk06Gy9hzPBX6npWpACqe8ZVZL6qGteHo6geISenGj0gxeL1gXE67lKca_oiJe3Wu_CRuzuOTqDMCBACnVCnbsp8hEu7ARurrg7RwE30o5q97cweh3nyUxerMxoZBWId1Yeb9bP4lN26fVmGNLEaRfAAYI3Tzwbt9hfzFYUwxITjgfm_2_tIm8wxkykhS-tfMpIHatFldvmY0TYTfwXG0F7DWJtz5ch4Xko8jnjuj3aBbxhnoVkF72-A7F4074CuTBfA3PQZ1nKgi8BUPwk=w861-h480-no?authuser=0" width="650"/>
<br>

2. You can drag and drop already existing folder or video file with anime and app will automatically take path of this folder and search for this anime.

<img src="https://lh3.googleusercontent.com/D2vPG9ZWFci2vySGPklNY7zlz07Xyt6cnJp9wry9muV0qG3FTi3898pou4dakaEOvQYvRicEgYhma2YtdvP7aKL2K6nKQQIJ1n6mzCqyqoVsKyDVbW-nhoS6732JkE3VKL4tQxsD41hJETKUsIROul9ypEn4swO7P6Rr2XApsa2TY4_QB_Zia1ITMvAzJaPXJg1eR_aqhZSRMVRSi61hWBreXC_nNHq3Cj_8h2xJD4WM_M4JH06xbGNZD_mHSVOht0ss0gifhN9DmO24nEIRb5e5iQPvaIv_WyPRpR-W2hShUKW1wacsnxEpJ4K9gDBkT_mldDpi1dT0z39M5GCikmTTze78Q8-uYF0kQEFoWB1MX0PfBVfiJCEhDwN-gc3QjURM4_ZzDkhHhg2Cmq2AcJ8iq05U-mjgCUWL8ghcnAXwe2FwGK9QJMpspYixd5CBvJ-2spN9tLBRnxpbzZsbfKGXtIOy6Lyl_FnIQGN3EYwftXE8es6siMltcb_Fqsh-Ejo8Qpk-aa1KmeMcO7mgAl6OHFmvHfrgaZT8OnuI-ciRNUiJw9uvRQMozptEGUBe_BHAPz5Ee_wScoDhCPuEI12agqjJcI2Lbc819d_MhXO-R0JmBaQSpDK8IgE77TkRGKlYh0RD1MwBEuGP7-GQZH4krk8pKcG-ZBL77_ExzlFNCywGZbCrFcgHQk7s-Hc=w604-h480-no?authuser=0" width="480"/>

<br>

## 3. After successful search
* You can select any of displayed posters and download it. Selected poster will be displayed in right window
* You can change download path by selecting folder image. It will open windows explorer
* You can search for another anime by inputing new name in anime search text area and clicki search

## 4. Additional features
<img src="gifs/4-icons.png" width="70"/>

* You can clear search results by clickg refresh icon in top left corner.
* Next to it is login icon that opens login window.

<img src="gifs/3-login-window.png" width="200"/>

* You can login to AniDB to search restricted content.
* Provide login and password and clock "Log in" button. App will remeber you by saving your session in cookies.
* After clicking login button chrome will open on top on the app and automatically log you in.  It is advised to not do anything during this process. It shouldn't take longer than 10s. 
* You can clear all your provided data and cookies by clicking "Clear login data" button.


### 5. Additional information
- App was tested on windows 10. In general it should work on other OS too, but it might have some path issues on saving files to computer so I don't provide binary for other platforms. 
- Your login, password and cookies on windows are stored in: AppData\Roaming\AniDB Poster Downloader\AniDB Poster Downloader
- App comes with unistaller so you can easly remove it from system.
- App installer will install app to default location on your system drive. 
- App has around 520MB. It weights so much because it comes with internal chrome browser that is used for searching and it weights 350MB. This chrome is independed of your current browsers. Uninstaller will delete internal chrome too.
- App uses web scraping to download posters. It means that it uses internal chrome in background to literraly simulate visiting AniDB by you and takes data from visited site.
 <br><br>
 
### Download app here: https://github.com/piotrkraszewski/AniDB-Poster-Downloader/releases

<br>

# How to develop the app

To run app in developer mode use:

`yarn start`

To create exe file for the app use command below. It will create exe files for your app and installer in relsease folder inside project files:

`yarn package`

To add dependency package use this syntax:

`yarn add "package name"` 

<br>

This project don't use `npm` so don't try any command with it because it will brake it. Unless of course you want to switch to `npm`.