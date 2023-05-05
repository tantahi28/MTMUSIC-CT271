const heading = $('.music-name');
const cdThumb = document.getElementById('#cd__thumb');
const audio = $('#myAudio');
const cd = $('.cd');
const play = $('.icon-play');
const pause = $('.icon-pause');
const playBtn = $('.ctrl__btn--toggle--play');
const progress = $('.ctrl__progress--value');
const durTimeProgress = $('.ctrl__progress-time--duration');
const currTimeProgress = $('.ctrl__progress-time--current');
const nextBtn = $('.ctrl__btn--next');
const prevBtn = $('.ctrl__btn--prev');
const randomBtn = $('.ctrl__btn--random');
const btnRepeat = $('.ctrl__btn--repeat');
const playList = $('.playlist');
const player = new Plyr('#myAudio', {
    controls: [
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'download',
    ],
});

var swiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    spaceBetween: 30,
    autoplay: {
        delay: 4000, // thời gian delay giữa các lần chuyển slide (đơn vị là ms)
        disableOnInteraction: false, // không bị tạm dừng khi người dùng tương tác (click, swipe, ...)
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
console.log(swiper);

/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random
 * 7. Next/ Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
let playlist = [];
let currentSongIndex = -1;
// player.off('download');



function getSongInfo(songId) {
    $.ajax({
        type: 'GET',
        url: '/api/songs/id/' + songId,
        success: function (data) {
            
            heading.text(data.songName);
            $('.artist').text(data.singerName);
            $('#myAudio').attr('src', data.urlSong);
            // Lưu thông tin bài hát vào Session Storage
            sessionStorage.setItem('currentSongInfo', JSON.stringify(data));

            //Xử lý khi download
            $('a[data-plyr="download"]').attr('href', data.urlSong);
            //Xử lý thumb
            cdThumb.setAttribute(
                'style',
                `background-image: url('${data.urlImg}')`,
            );
            player.play();
            currentSongIndex = data._id;
            // Lấy thể loại của bài hát
            var songGenre = data.genre;

            // Gửi yêu cầu lấy danh sách các bài hát cùng thể loại
            $.ajax({
                type: 'GET',
                url: '/api/songs/genre/' + songGenre,
                success: function (data) {
                    playlist = data;
                    currentSongIndex = playlist.findIndex(
                        (song) => song._id === songId,
                    );
                    renderPlaylist();
                    $('.heading-genre').text(data.genre);
                },
                error: function (xhr, status, error) {
                    console.log('Error:', error);
                },
            });
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);
        },
    });
}







function renderPlaylist() {
    let songList = '';
    // Lấy thông tin bài hát đang phát từ Session Storage
    const currentSongInfo = JSON.parse(sessionStorage.getItem('currentSongInfo'));
    // Render danh sách bài hát cùng thể loại
    for (let i = 0; i < playlist.length; i++) {
        let song = playlist[i];
        songList += `
        <div class="music__list" data-songId='${
            song._id
        }' onclick="getSongInfo('${song._id}')">
            <div class="list__song ${song._id === currentSongInfo._id ? 'active' : ''}">
                <div style="background-image: url(${
                    song.urlImg
                })" class="list__thumb"></div>
                <div class="list__body">
                    <h3 class="titile">${song.songName}</h3>
                    <p class="author">${song.singerName}</p>
                </div>
            </div>
            <div class="list__fav">
                <i class="fa-solid fa-heart"></i>
            </div>
        </div>
        `;
    }
    playList.html(songList);
}

  


document.querySelector('.media-right').addEventListener('click', function(event) {
    event.stopPropagation(); // Ngăn chặn sự kiện click từ bubble lên các phần tử cha
  });

function playNextSong() {
    if (player.random) {
        playRandomSong();
    } else {
        if (currentSongIndex < playlist.length - 1) {
            currentSongIndex++;
            let nextSong = playlist[currentSongIndex];
            getSongInfo(nextSong._id);
        } else {
            currentSongIndex = 0;
            let nextSong = playlist[currentSongIndex];
            getSongInfo(nextSong._id);
        }
    }
}


function playPrevSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
        let prevSong = playlist[currentSongIndex];
        getSongInfo(prevSong._id);
    } else {
        currentSongIndex = playlist.length - 1;
        let prevSong = playlist[currentSongIndex];
        getSongInfo(prevSong._id);
    }
}



//Xử lý CD quay và dừng

// const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
//     duration: 10000,
//     iterations: Infinity,
//     easing: 'linear',
// });
// cdThumbAnimate.pause();

// player.on('play', () => {
//     if (player.source === null) return; // Nếu không có source thì không quay CD
//     cdThumbAnimate.play();
// });

// player.on('pause', () => {
//     cdThumbAnimate.pause();
// });

// player.on('ended', () => {
//     if (player.source === null) return;
//     cdThumbAnimate.pause();
//     cdThumbAnimate.currentTime = 0;
// });

// //Xử lý khi repeat song
// player.on('ended', function (event) {
//     if (player.repeat) {
//         player.play(); // Chạy lại bài hát nếu repeat được bật
//     }
// });
// btnRepeat.click(function () {
//     player.repeat = !player.repeat; // Bật/tắt repeat
//     btnRepeat.toggleClass('active', player.repeat); // Thêm/xóa class active để highlight nút repeat
// });

// Xử lý ramdom song
function playRandomSong() {
    let randomIndex;
    if (player.random && playlist.length > 1) {
        // Nếu đang chế độ nghe nhạc ngẫu nhiên và playlist có nhiều hơn 1 bài hát
        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentSongIndex); // Không chọn lại bài hát hiện tại
    } else {
        // Ngược lại, chọn bài hát tiếp theo trong playlist
        randomIndex = (currentSongIndex + 1) % playlist.length;
    }
    currentSongIndex = randomIndex;
    let randomSong = playlist[currentSongIndex];
    getSongInfo(randomSong._id);
}
// randomBtn.click(function () {
//     player.random = !player.random; // Bật/tắt random
//     randomBtn.toggleClass('active', player.random); // Thêm/xóa class active để highlight nút random
//     if (!player.repeat && player.random) {
//         player.on('ended', () => {
//             playRandomSong();
//         });
//     }
// });

// //Xử lý next song khi audio ended
// player.on('ended', () => {
//     if ((!player.repeat && !player.random) || !player.repeat) {
//         nextBtn.click();
//     }
// });
