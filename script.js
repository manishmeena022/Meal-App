let favourites = [];

//DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const favouritesList = document.getElementById('favouritesList');

//Event Listeners
searchInput.addEventListener('input',searchMeal);
favouritesList.addEventListener('click',removeFromFavourites);

function searchMeal(){
    const searchQuery = searchInput.value.trim();
    if(searchQuery === ''){
        searchResults.innerHTML = '';
        return;
    }
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`)
        .then(response => response.json())
        .then(data => {
            if(data.meals === null){
                searchResults.innerHTML = '<p>No Results found </p>';
            } else {
                const mealItems = data.meals.map(meal => {
                    const mealItem = document.createElement('div');
                    mealItem.classList.add('card');
                    mealItem.innerHTML = `
                    <div class="row">
                            <div class="col">
                                <h5 class="card-title">${meal.strMeal}</h5>
                                <div class="d-flex">
                                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}"> 
                                </div>
                            </div>
                            
                            <div class="col">
                                <div class="card-body">
                                    <button type="button" class="moreDetails"  onClick="showMealDetails(${meal.idMeal})">More Details</button>
                                    <button type="button" class="addToFav" data-id="${meal.idMeal}">Add Favourites</button>
                                </div>
                            </div>
                        </div>                    
                    `;
                    return mealItem;
                });

                searchResults.innerHTML='';
                mealItems.forEach(item => {
                    const favouriteBtn = item.querySelector('.addToFav');
                    favouriteBtn.addEventListener('click', addToFavourites);
                    searchResults.appendChild(item);
                });
            }
        })
        .catch(error => {
            console.error('Error: ', error);
        });
}

async function showMealDetails(id) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        if (data.meals === null) {
            searchResults.innerHTML = '<p>No Results found</p>';
            return;
        }
        const meal = data.meals[0];
        const html = `
            <div id="meal-details">
                <div id="meal-header">
                    <div id="meal-thumbnail">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" height="300px" width="300px">
                    </div>
                    <div id="details">
                        <h1>Name: ${meal.strMeal}</h1>
                        <h3>Category: ${meal.strCategory}</h3>
                    </div>
                </div>
                <div id="meal-instruction">
                    <h3>Instruction:</h3>
                    <p>${meal.strInstructions}</p>
                </div>
            </div>`;
        document.getElementById("meal-details").innerHTML = html;
    } catch (error) {
        console.error('Error: ', error);
    }
}
function addToFavourites(event){
    const mealId = event.target.dataset.id;

    if(!favourites.includes(mealId)){
        favourites.push(mealId);
        saveFavouritesToLocalStorage();
        displayFavourites();
    }
}

function removeFromFavourites(event){
    if(event.target.classList.contains('remove-btn')){
        const mealId = event.target.dataset.id;
        favourites = favourites.filter(id => id !== mealId);
        saveFavouritesToLocalStorage();
        displayFavourites();
    }
}
function saveFavouritesToLocalStorage(){
    localStorage.setItem('favourites' , JSON.stringify(favourites));
}

function loadFavouritesFromLocalStorage(){
    const favouritesData = localStorage.getItem('favourites');
    if(favouritesData){
        favourites = JSON.parse(favouritesData);
        displayFavourites();
    }
}

function displayFavourites(){
    if(favourites.length === 0){
        favouritesList.innerHTML = "<p> No Favourite meals yet !</p>";
    }else{
        favouritesList.innerHTML = '';
        favourites.forEach(mealId => {
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
                .then(response => response.json())
                .then(data => {
                    const meal = data.meals[0];
                    const listItem = document.createElement('li');
                    listItem.classList.add('list-group-item');
                    listItem.innerHTML = `
                    <div class="fav">
                        <div>
                            <h1>${meal.strMeal}</h1>
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" heigth="200px"; width="200px">
                        </div>
                        <div >
                            <button type="button" class="moreDetails"  onClick="showMealDetails(${meal.idMeal})">More Details</button>
                            <button type="button" class="removeFromFav btn-sm remove-btn" data-id="${meal.idMeal}">Remove</button>
                        </div>
                    </div>
                    `;
                    favouritesList.appendChild(listItem);
                })
                .catch(error => {
                    console.log('Error: ', error);
                });
        });
    }
    
}

loadFavouritesFromLocalStorage();
