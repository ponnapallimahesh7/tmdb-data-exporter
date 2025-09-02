const fetchbutton = document.getElementById('fetching');
const movieList = document.getElementById('movie-list');
const downloadBtn = document.getElementById('download-csv'); 

let currentdata = []; // Store fetched data for export

fetchbutton.addEventListener('click', async () => {
    try {
        // Fetch genres first
        const genresRes = await fetch("https://api.themoviedb.org/3/genre/movie/list?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US");
        const genresData = await genresRes.json();
        const genreMap = {};
        genresData.genres.forEach(genre => {
            genreMap[genre.id] = genre.name;
        });
        console.log(genreMap);
        // Fetch multiple pages (example: first 3 pages)
        const totalPages = 3; // Change to 470 if you want all (not recommended)
        const moviePromises = [];
        for (let page = 1; page <= totalPages; page++) {
            moviePromises.push(
                fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US&page=${page}`)
                    .then(res => res.json())
            );
        }
        const moviesPages = await Promise.all(moviePromises);

        // Combine all movies
        const allMovies = moviesPages.flatMap(page => page.results);

        // Map movies to include genre names
        currentdata = allMovies.map(movie => ({
            original_title: movie.original_title,
            overview: movie.overview,
            genres: movie.genre_ids.map(id => genreMap[id]).join(', ')
        }));

        // Display on screen
        movieList.innerHTML = currentdata.map(movie => 
            `<div style="border:1px solid #ccc; margin:10px; padding:10px; border-radius:8px;">
                <h3 style="margin-bottom:5px;">${movie.original_title}</h3>
                <p style="margin-top:0; color:#555;">${movie.overview}</p>
                <p style="font-style:italic; color:#0077cc;">Genres: ${movie.genres}</p>
            </div>`
        ).join('');
    } catch (err) {
        console.error(err);
    }
});

// CSV download functionality
downloadBtn.addEventListener('click', () => {
    if (!currentdata.length) return;
    const csvRows = [
        ['Title', 'Description', 'Genre'],
        ...currentdata.map(movie => [
            `"${movie.original_title.replace(/"/g, '""')}"`,
            `"${movie.overview.replace(/"/g, '""')}"`,
            `"${movie.genres.replace(/"/g, '""')}"`
        ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});