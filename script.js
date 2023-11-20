let favourites = [];

//DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const favouritesList = document.getElementById('favouritesList');

//Event Listeners
searchInput.addEventListener('input',searchMeal);
favouritesList.addEventListener('click',removeFromFavourites);


//  Searching for Meal
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
                    mealItem.classList.add('card', 'mb-3', 'row', 'g-0');
                    mealItem.innerHTML = `
                   <div class="row g-0">
                        <div class="col-md-4">
                            <h5 class="card-title">${meal.strMeal}</h5>
                            <div class="d-flex">
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid rounded-start me-2">
                                
                            </div>
                        </div>
                        
                        <div class="col-md-8">
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


// Showing details of Meal
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
            <div id="meal-details" class="mb-5">
                <div id="meal-header" class="d-flex justify-content-around flex-wrap">
                    <div id="meal-thumbnail">
                        <img class="mb-2" src="${meal.strMealThumb}" alt="${meal.strMeal}" height="300px" width="300px">
                    </div>
                    <div id="details">
                        <h1>Name: ${meal.strMeal}</h1>
                        <h3>Category: ${meal.strCategory}</h3>
                    </div>
                </div>
                <div id="meal-instruction" class="mt-3">
                    <h3 class="text-center">Instruction:</h3>
                    <p>${meal.strInstructions}</p>
                </div>
            </div>`;
        document.getElementById("meal-details").innerHTML = html;
    } catch (error) {
        console.error('Error: ', error);
    }
}

// Adding Meal To Favourites
function addToFavourites(event){
    const mealId = event.target.dataset.id;

    if(!favourites.includes(mealId)){
        favourites.push(mealId);
        saveFavouritesToLocalStorage();
        displayFavourites();
    }
}

// Removing Meal from Favourite
function removeFromFavourites(event){
    if(event.target.classList.contains('remove-btn')){
        const mealId = event.target.dataset.id;
        favourites = favourites.filter(id => id !== mealId);
        saveFavouritesToLocalStorage();
        displayFavourites();
    }
}

// Saving Favourite meal to local Storage 
function saveFavouritesToLocalStorage(){
    localStorage.setItem('favourites' , JSON.stringify(favourites));
}

//get favourite meal from local storage
function loadFavouritesFromLocalStorage(){
    const favouritesData = localStorage.getItem('favourites');
    if(favouritesData){
        favourites = JSON.parse(favouritesData);
        displayFavourites();
    }
}

// showing Favourite Meals
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
                        <div class="col-2">
                            <h1>${meal.strMeal}</h1>
                            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" heigth="200px"; width="200px">
                        </div>
                        <div class="col-2">
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

//loading favourtie meals
loadFavouritesFromLocalStorage();
