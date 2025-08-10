let currentsong = new Audio()
let songs=[];
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currFolder=folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div=document.createElement("div")
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
    songs=[]
    for(let index=0;index<as.length;index++){
        const element=as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
    return songs
}

const playmusic = (track,pause=false) => { 

     // Get the song object at the provided index
    currentsong.src = `/${currFolder}/`+track // Set the source to the song URL
    if(!pause){
        currentsong.play(); // Play the song
       play.src = "pause.svg";
    } 
    document.querySelector(".songinfo").innerHTML = decodeURI(track); // Update song info
    document.querySelector(".songtime").innerHTML = "00:00/00:00"; // Reset the song time display
};

async function displayalbums(){
    
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div=document.createElement("div")
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardcontainer=document.querySelector(".cardcontainer")
    Array.from(anchors).forEach(async e=>{
        if(e.href.includes("/songs/")){
            let folder= (e.href.split("/").slice(-1)[0])
  

          let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
          let response = await a.json();
          const card = document.createElement("div");
          card.classList.add("card");
          card.dataset.folder = folder;
          card.innerHTML = `
              <div class="play">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                      <circle cx="18" cy="18" r="18" fill="none" />
                      <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="0.2" stroke-linejoin="round" fill="black" />
                  </svg>
              </div>
              <img src="/songs/${folder}/coverimg.png" alt="">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
          `;

          // Append the card to the card container
          cardcontainer.appendChild(card);

          // Add event listener to the newly created card
          card.addEventListener("click", async item => {

              // Clear previous songs before appending new ones
              const songContainer = document.querySelector(".songContainer");
              songContainer.innerHTML = ""; // Clear previous songs

              // Fetch the songs for the selected folder
              let songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
              playmusic(songs[0])

              // Append songs to the page (use your method to display songs)
              songs.forEach(song => {
                  const songElement = document.createElement("div");
                  songElement.classList.add("song");
                  songContainer.appendChild(songElement);
              });
          });
      }
  });
}


async function main() {
    songs = await getsongs("songs/ncs");
    playmusic(songs[0],true)

   //displaying albums
   displayalbums()


play.addEventListener("click", () => {
    if (currentsong.paused) {
        currentsong.play()
        play.src = "pause.svg"
    } else {
        currentsong.pause()
        play.src = "play.svg"
    }
}
)

currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong
        .duration)}`
    document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";

})

document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left=percent+"%";
    currentsong.currentTime=((currentsong.duration) * percent)/100
})

document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0";
})

document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%";
})

previous.addEventListener("click", () => {
    currentsong.pause();
    
    // Get the filename from currentsong.src and ensure it’s URL encoded
    let currentSongName =(currentsong.src.split("/").pop());

    // Find the index using the encoded filename
    let index = songs.indexOf(currentSongName);


    if ((index-1)>= 0) {
        playmusic(songs[index - 1]);
    }
});

// Add an event listener to next
next.addEventListener("click", () => {
    currentsong.pause();
   

    // Get the filename from currentsong.src and ensure it’s URL encoded
    let currentSongName = (currentsong.src.split("/").pop());
   

    // Find the index using the encoded filename
    let index = songs.indexOf(currentSongName);


    if ((index + 1) < songs.length) {
        playmusic(songs[index + 1]);
    }
});




}
    



main();
















