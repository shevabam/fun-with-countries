
let searchBtn = document.getElementById("search-btn");
let searchInput = document.getElementById('country-name');
let countries_list = document.querySelector('.list-countries');
let base_api_url = `https://restcountries.com/v3.1`;


let getCountries = () => {
    let api_url = `${base_api_url}/all?fields=name,cca3`;
    
    fetch(api_url).then((resp) => resp.json()).then((data) => {
        let countries = data.sort((a,b) => (a.name.common > b.name.common) ? 1 : ((b.name.common > a.name.common) ? -1 : 0));

        countries_list.querySelector('.loader-wrapper').remove();

        if (countries.length > 0) {
            countries.forEach(function(country){
                countries_list.insertAdjacentHTML('beforeend', `
                <li data-cca3="${country.cca3}">${country.name.common}</li>
                `
                );
            });
        }
        else {
            countries_list.innerHTML = `<div class="msg">No country found</div>`;
        }
    });
}

let filterList = () => {
    let list_items = countries_list.getElementsByTagName('li');

    for (var i = 0; i < list_items.length; i++) {
        let item_text = list_items[i].textContent || list_items[i].innerText;

        if (item_text.toUpperCase().indexOf(searchInput.value.toUpperCase()) > -1) {
            list_items[i].style.display = '';
        }
        else {
            list_items[i].style.display = 'none';
        }
    }
}


let getCountry = (cca3) => {
    let result = document.getElementById("result");
    
    result.innerHTML = `<div class="loader-wrapper"><div class="loader"></div></div>`;

    if (cca3.length <= 0) {
        result.innerHTML = `<div class="msg">Please enter a country name </div>`;
    }
    else {
        let api_url = `${base_api_url}/alpha/${cca3}?fields=name,cca3,capital,currencies,flags,population,maps`;

        fetch(api_url).then((resp) => resp.json()).then((data) => {
            if (typeof data.status != 'undefined' && data.status == '404')
                result.innerHTML = `<div class="msg">${data.message}</div>`;
            else {
                document.querySelectorAll(`.list-countries li.active`).forEach(function(elt){
                    elt.classList.remove('active');
                });
                document.querySelector(`.list-countries li[data-cca3="${cca3}"]`).classList.add('active');

                let country = data;

                let details = '';
                
                if ('currencies' in country && Object.values(country.currencies).length > 0) {
                    let currency = Object.values(country.currencies)[0];

                    details += `
                        <li><span class="label">Currency: </span><span>${currency.name} (${currency.symbol})</span></li>
                    `;
                }

                if ('capital' in country && country.capital != '') {
                    details += `
                        <li><span class="label">Capital: </span><span>${country.capital}</span></li>
                    `;
                }

                if ('population' in country && country.population != '') {
                    details += `
                        <li><span class="label">Population: </span><span>${new Intl.NumberFormat().format(country.population)}</span></li>
                    `;
                }

                result.innerHTML = `
                <div class="info">
                    <img src="${country.flags.png}" class="flag" title="${country.flags.alt}">
                    <div>
                        <h2>${country.name.common}</h2>
                        <div class="official-name">
                            ${country.cca3} - ${country.name.official}
                        </div>
                    </div>
                </div>
                
                <ul class="details">${details}</ul>

                <div class="map">
                    🗺️ <a href="${country.maps.googleMaps}">View in Google Maps</a>
                </div>
                `;
            }
        });
    }

}

// searchInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') filterList(); });
window.addEventListener("load", getCountries);

countries_list.addEventListener("click", (e) => {
    e.preventDefault();
    getCountry(e.target.getAttribute('data-cca3'));
});

searchInput.addEventListener("input", filterList);