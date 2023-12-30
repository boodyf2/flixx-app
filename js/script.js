const global = {
  currentPage: window.location.pathname,
  api: {
    apiKey: "5e9a9f9bbfa2174db2a643f9fc0e83c2",
    apiUrl: "https://api.themoviedb.org/3",
  },
  search: {
    type: "",
    term: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
};

//Highlight active link
function highlighActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

//Displays the now playing slider
async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
      <a href="movie-details?id=${movie.id}">
        <img src="${
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            : "../images/no-image.jpg"
        }" 
        alt="${movie.title}" 
        />
      </a>
      <h4 class="swiper-rating">
        <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
          1
        )} / 10
      </h4>
    `;
    document.querySelector(".swiper-wrapper").appendChild(div);
  });

  initSwiper();
}

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: false,
    autoplay: {
      display: 1000,
      disableonInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

// Displays the popular movies in movies page
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");
  console.log(results);
  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <a href="movie-details?id=${movie.id}">
        <img
          src="${
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
              : "../images/no-image.jpg"
          }"
          class="card-img-top"
          alt="${movie.title}"
        />
      </a>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
      </div>
      `;
    document.querySelector("#popular-movies").appendChild(div);
  });
}

// Displays the popular tv shows in tv shows page
async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");
  console.log(results);
  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <a href="tv-details?id=${show.id}">
        <img
          src="${
            show.poster_path
              ? "https://image.tmdb.org/t/p/w500/" + show.poster_path
              : "../images/no-image.jpg"
          }"
          class="card-img-top"
          alt="${show.name}"
        />
      </a>
      <div class="card-body">
        <h5 class="card-title">${show.name}</h5>
      </div>
      `;
    document.querySelector("#popular-shows").appendChild(div);
  });
}

async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1];

  const movie = await fetchAPIData(`movie/${movieId}`);

  let inWatchlist = inDataFromStorage(movie.id);

  // Overlay for background image
  displayBackgroundImage("movie", movie.backdrop_path);

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img
          src="${
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
              : "../images/no-image.jpg"
          }"
          class="card-img-top"
          alt="${movie.title}"
        />
      </div>
      <div>
        <h2>${movie.title}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${movie.release_date}</p>
        <p>
          ${movie.overview}
          <br>
          <button class="btn ${
            inWatchlist ? "remove-btn" : ""
          }" id="watchlist-add-btn">
          ${
            inWatchlist
              ? '<i class="fas fa-remove"></i> Remove from Watchlist'
              : '<i class="fas fa-add"></i> Add to Watchlist'
          }
          </button>
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${movie.genres.map((genre) => `<li>${genre.name}`).join("")}
        </ul>
        <a href="${
          movie.homepage
        }" target="_blank" class="btn">Visit Movie Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
      <h2>Movie Info</h2>
      <ul>
        <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(
          movie.budget
        )}</li>
        <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(
          movie.revenue
        )}</li>
        <li><span class="text-secondary">Runtime:</span> ${
          movie.runtime
        } minutes</li>
        <li><span class="text-secondary">Status:</span> ${movie.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${movie.production_companies.map((company) => company.name).join(", ")}
      </div>
    </div>
  `;

  document.querySelector("#movie-details").appendChild(div);

  getRecomendations("movie", movieId);

  document.querySelector("#movie-details").appendChild(div);
  document
    .querySelector("#watchlist-add-btn")
    .addEventListener("click", (e) => {
      inWatchlist = inDataFromStorage(movie.id);
      if (!inWatchlist) {
        const data = {
          id: movie.id,
          type: "movie",
          title: movie.title,
          posterImg: "https://image.tmdb.org/t/p/w500/" + movie.poster_path,
          rating: movie.vote_average.toFixed(1),
        };
        setDataToStorage(data);
        e.currentTarget.classList.add("remove-btn");
        e.currentTarget.innerHTML =
          '<i class="fas fa-remove"></i> Remove from Watchlist';
      } else {
        removeDataFromStorage(movie.id);
        e.currentTarget.classList = "btn";
        e.currentTarget.innerHTML =
          '<i class="fas fa-add"></i> Add to Watchlist';
      }
    });
}

// Display Show Details
async function displayShowDetails() {
  const showId = window.location.search.split("=")[1];

  const show = await fetchAPIData(`tv/${showId}`);

  // Overlay for background image
  displayBackgroundImage("tv", show.backdrop_path);

  let inWatchlist = inDataFromStorage(show.id);

  const div = document.createElement("div");

  div.innerHTML = `
      <div class="details-top">
      <div>
        <img
          src="${
            show.poster_path
              ? "https://image.tmdb.org/t/p/w500/" + show.poster_path
              : "../images/no-image.jpg"
          }"
          class="card-img-top"
          alt="${show.name}"
        />
      </div>
      <div>
        <h2>${show.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Last Air Date: ${show.last_air_date}</p>
        <p>
          ${show.overview}
          <br>
          <button class="btn ${
            inWatchlist ? "remove-btn" : ""
          }" id="watchlist-add-btn">
          ${
            inWatchlist
              ? '<i class="fas fa-remove"></i> Remove from Watchlist'
              : '<i class="fas fa-add"></i> Add to Watchlist'
          }
          </button>
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${show.genres.map((genre) => `<li>${genre.name}</li>`).join("")}
        </ul>
        <a href="${
          show.homepage
        }" target="_blank" class="btn">Visit show Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
      <h2>Show Info</h2>
      <ul>
        <li><span class="text-secondary">Number of Episodes:</span> ${
          show.number_of_episodes
        }</li>
        <li><span class="text-secondary">Last Episode To Air:</span> ${
          show.last_episode_to_air.name
        }</li>
        <li><span class="text-secondary">Status:</span> ${show.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${show.production_companies
          .map((company) => `<span>${company.name}</span>`)
          .join(", ")}
      </div>
    </div>
  `;

  document.querySelector("#show-details").appendChild(div);

  getRecomendations("show", showId);

  document
    .querySelector("#watchlist-add-btn")
    .addEventListener("click", (e) => {
      inWatchlist = inDataFromStorage(show.id);
      if (!inWatchlist) {
        const data = {
          id: show.id,
          type: "show",
          title: show.name,
          posterImg: "https://image.tmdb.org/t/p/w500/" + show.poster_path,
          rating: show.vote_average.toFixed(1),
        };
        setDataToStorage(data);
        e.currentTarget.classList.add("remove-btn");
        e.currentTarget.innerHTML =
          '<i class="fas fa-remove"></i> Remove from Watchlist';
      } else {
        removeDataFromStorage(show.id);
        e.currentTarget.classList = "btn";
        e.currentTarget.innerHTML =
          '<i class="fas fa-add"></i> Add to Watchlist';
      }
    });
}

async function getRecomendations(type, id) {
  const { results } = await fetchAPIData(
    `${
      type === "movie"
        ? `movie/${id}/recommendations`
        : `tv/${id}/recommendations`
    }`
  );

  if (results.length === 0) {
    const h1 = document.createElement("h1");
    h1.innerText = `${
      type === "movie"
        ? "No similar movies available"
        : "No similar shows available"
    }`;
    h1.style.margin = "0 auto";
    h1.style.fontSize = "50px";
    document.querySelector(".swiper-wrapper").appendChild(h1);
  }

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
      <a href="${
        type === "movie"
          ? `movie-details?id=${result.id}`
          : `tv-details?id=${result.id}`
      }">
        <img src="${
          result.poster_path
            ? `https://image.tmdb.org/t/p/w500/${result.poster_path}`
            : "../images/no-image.jpg"
        }" 
        alt="${type === "movie" ? result.title : result.name}" 
        />
      </a>
      <h4 class="swiper-rating">
        <i class="fas fa-star text-secondary"></i> ${result.vote_average.toFixed(
          1
        )} / 10
      </h4>
    `;
    document.querySelector(".swiper-wrapper").appendChild(div);
  });

  initSwiper();

  console.log(results);
}

function displayWatchlist() {
  const dataSet = getDataFromStorage();

  dataSet.forEach((data) => {
    const li = document.createElement("li");
    li.classList.add("watchlist-card");
    li.dataset.id = data.id;
    li.innerHTML = `
        <div class="overview">
          <a href="${
            data.type === "movie"
              ? `movie-details?id=${data.id}`
              : `tv-details?id=${data.id}`
          }">
            <img src="${
              data.posterImg ? data.posterImg : "../images/no-image.jpg"
            }" alt="${data.title}" width="100px" />
          </a>
          <div class="info">
            <p class="title">${data.title}</p>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${data.rating} / 10
            </p>
          </div>
        </div>
        <i class="fas fa-remove remove-btn"></i></button>
      `;
    document.querySelector(".watchlist").appendChild(li);
  });

  document.querySelector(".watchlist").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const id = e.target.parentElement.dataset.id;
      removeDataFromStorage(id);

      e.target.parentElement.remove();
    }
  });
}

function getDataFromStorage() {
  let dataSet;
  if (localStorage.getItem("dataSet") === null) {
    dataSet = [];
  } else {
    dataSet = JSON.parse(localStorage.getItem("dataSet"));
  }
  return dataSet;
}

function setDataToStorage(data) {
  const dataSet = getDataFromStorage();
  dataSet.push(data);
  localStorage.setItem("dataSet", JSON.stringify(dataSet));
}

function removeDataFromStorage(id) {
  const dataSet = getDataFromStorage();
  console.log(id);
  const newDataSet = dataSet.filter((data) => {
    return data.id != id;
  });
  localStorage.setItem("dataSet", JSON.stringify(newDataSet));
}

function inDataFromStorage(id) {
  let inDataSet = false;

  const dataSet = getDataFromStorage();

  dataSet.forEach((data) => {
    if (data.id === id) {
      inDataSet = true;
    }
  });

  return inDataSet;
}

async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.type = urlParams.get("type");
  global.search.term = urlParams.get("search-term");

  if (global.search.type !== "" && global.search.term !== "") {
    const { results, total_pages, page, total_results } = await searchAPIData();

    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      showAlert("No results found", "green-bg");
      return;
    }

    displaySearchResults(results);
  } else {
    showAlert("Please enter a search term");
  }
}

function displaySearchResults(results) {
  window.scrollTo(0, 0);
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
        <a href="${global.search.type}-details?id=${result.id}">
          ${
            result.poster_path
              ? `<img
            src="https://image.tmdb.org/t/p/w500/${result.poster_path}"
            class="card-img-top"
            alt="${global.search.type === "movie" ? result.title : result.name}"
          />`
              : `<img
          src="../images/no-image.jpg"
          class="card-img-top"
          alt="${global.search.type === "movie" ? result.title : result.name}"
        />`
          }
        </a>
        <div class="card-body">
          <h5 class="card-title">${
            global.search.type === "movie" ? result.title : result.name
          }</h5>

        </div>
      `;

    document.querySelector("#search-results-heading").innerHTML = `
      <h2>${global.search.totalResults} Total results for "${global.search.term}"</h2>
    `;
    document.querySelector("#search-results").appendChild(div);
  });

  displayPagination();
}

function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");
  div.innerHTML = `
      <button class="btn btn-primary" id="prev">Prev</button>
      <button class="btn btn-primary" id="next">Next</button>
      <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
    `;

  document.querySelector("#pagination").appendChild(div);

  const nextBtn = document.querySelector("#next");
  const prevBtn = document.querySelector("#prev");

  if (global.search.page === 1) {
    prevBtn.disabled = true;
  }

  if (global.search.page === global.search.totalPages) {
    nextBtn.disabled = true;
  }

  // next page
  nextBtn.addEventListener("click", async () => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });
}

function showAlert(error, type = "red-bg") {
  const alertEl = document.createElement("div");
  alertEl.classList.add("alert");
  alertEl.classList.add(type);
  alertEl.appendChild(document.createTextNode(error));
  document.querySelector("#alert").appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

// Fetch data from an endpoint
async function fetchAPIData(endpoint) {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();
  const results = await fetch(
    `${API_URL}/${endpoint}?api_key=${API_KEY}&language=en-US`
  );
  const response = await results.json();
  hideSpinner();

  return response;
}

async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${API_URL}/search/${global.search.type}?api_key=${API_KEY}&langauge=en-US&query=${global.search.term}&page=${global.search.page}`
  );

  const data = await response.json();

  hideSpinner();

  return data;
}

// Display Backdrop On Details Pages
function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector("#movie-details").appendChild(overlayDiv);
  } else {
    document.querySelector("#show-details").appendChild(overlayDiv);
  }
}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Init App
function init() {
  switch (global.currentPage) {
    case "/":
    case "/index":
      displaySlider();
      displayPopularMovies();
      break;
    case "/shows":
      displayPopularShows();
      break;
    case "/search.html":
      search();
      break;
    case "/movie-details":
      displayMovieDetails();
      break;
    case "/tv-details":
      displayShowDetails();
      break;
    case "/watchlist":
      displayWatchlist();
      break;
  }

  highlighActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
