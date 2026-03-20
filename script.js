// API_KEY TMDB
const API_KEY = "7241edb253b80bf5dede6dc20fd5c7f7";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w200";
const LOCAL_API = "http://localhost:3000/movies";

let movieList = document.getElementById("movieList");
let inputField = document.getElementById("inputField");
let saveBtn = document.getElementById("saveBtn");

// render movies on the page function
function renderMovies() {
  // empty movieList UL
  movieList.innerHTML = "";
  // local_api is data.json "movies" object, we map th result to (movie)
  fetch(LOCAL_API)
    .then((res) => res.json())
    .then((data) => {
      data.sort((a, b) => b.userRating - a.userRating); //sort from highest rated to lowest rated (top-list style)
      data.map((movie) => {
        let li = document.createElement("li");

        // Poster image, will be placeholder if not found
        let img = document.createElement("img");
        img.src = movie.poster_path
          ? IMG_BASE_URL + movie.poster_path
          : "https://via.placeholder.com/100x150";
        img.classList.add("moviePoster");
        li.appendChild(img);

        // Information div with labels fetched from my json server
        let infoDiv = document.createElement("div");
        infoDiv.classList.add("movieInfo");
        infoDiv.innerHTML = `
          <p>Title: ${movie.title}</p>
          <p>Release date: ${movie.release_date}</p>
          <p>Your rating: ${movie.userRating}/10</p>
          <p>ID: ${movie.id}</p>
        `;
        li.appendChild(infoDiv);

        // user rating of movie, input for 0-10 & classlist for small styling
        let rateInput = document.createElement("input");
        rateInput.type = "number";
        rateInput.value = movie.userRating;
        rateInput.min = "0";
        rateInput.max = "10";
        rateInput.classList.add("personalMovieScore");
        li.appendChild(rateInput);

        // update rating of the movie
        let updateBtn = document.createElement("button");
        updateBtn.textContent = "EDIT RATING";
        updateBtn.classList.add("updateBtn");
        updateBtn.addEventListener("click", () =>
          updateRating(movie.id, rateInput.value),
        );
        li.appendChild(updateBtn);

        // Delete Button
        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("deleteBtn"); // add css styling ( red gradient button)
        deleteBtn.textContent = "DELETE";
        deleteBtn.addEventListener("click", () => deleteMovie(movie.id));
        li.appendChild(deleteBtn);

        movieList.appendChild(li);
      });
    });
}

// on saveBtn click, take my "API_KEY" & searchTerm and search using TMDB API for movie
saveBtn.addEventListener("click", async (evt) => {
  evt.preventDefault();
  const searchTerm = inputField.value;
  if (!searchTerm) return;

  const tmdbResponse = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`,
  );
  const tmdbData = await tmdbResponse.json();

  // if more than one movie is returned from TMDB, select first one
  if (tmdbData.results.length > 0) {
    const movie = tmdbData.results[0];
    // Save title, poster_path (link to movie img) & release date to my json db
    const movieToSave = {
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      userRating: 0, // show user rating at 0 every time we add a new movies
    };

    // POST "movieToSave" taking all that was just fetched to my data.json
    await fetch(LOCAL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieToSave),
    });

    renderMovies();
    inputField.value = ""; // empty empty input field
  } else {
    alert("Hittade ingen film!");
  }
});

// DELETE function, takes in ID to remove correct movie from database, and "re-render" movies on page
async function deleteMovie(id) {
  await fetch(`${LOCAL_API}/${id}`, { method: "DELETE" });
  renderMovies();
}

// PUT to "edit" the rating of the movie of your chosice (id) and set userRating as the new rating instead
async function updateRating(id, newRating) {
  const res = await fetch(`${LOCAL_API}/${id}`);
  const movie = await res.json();
  movie.userRating = newRating;
  await fetch(`${LOCAL_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  renderMovies();
}

renderMovies();
