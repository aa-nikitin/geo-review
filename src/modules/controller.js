import model from './model.js';
import view from './view.js';

const formatDate = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

let myMap,
    clusterer,
    addressMap;

let lastId = 0;
let thisId = 0;
let objGlobRev = {};



export default {
    openBalloon(coords, tmp) { // открытие балуна
        if (!this.myMap.balloon.isOpen()) {   
            this.geocodeAddress(coords).then(address => {
                this.myMap.balloon.open(coords, {
                    contentLayout: address
                }, {
                    balloonShadow: false,
                    layout: tmp,
                    balloonPanelMaxMapArea: 0
                });
                this.addressMap = address;
            });
        } else {
            this.myMap.balloon.close();
            thisId = 0;
        }
    },
    addMarker(coords, tmp, review) { // создание метки  
        let that = this;  
        let idMark;
        
        if (objGlobRev[thisId]) {
            idMark = thisId;     
        } else {
            lastId++;
            idMark = lastId;
            thisId = lastId;
        }        
        
        let coordsPoint = this.coordFormat(coords[0], coords[1]);    
        let myPlacemark = new ymaps.Placemark(coordsPoint, {
            id: idMark,
            balloonContentHeader: `${review.feedbackName.value}`,
            balloonContentBody: `
                ${this.addressMap}(${review.feedbackPlace.value}) 
                <div>${review.feedbackMessage.value}</div>
            `,
            balloonContentFooter: `${review.date.toLocaleString("ru", formatDate)}`
        },{
            openBalloonOnClick: false
        });
        
        myPlacemark.events.add('click', function (e) {
            //console.log(e.get('target').properties.get('id'));
            
            //document.querySelector('.map-popup__add').setAttribute('data-id', 'sdf') ;
            //console.log(e.get('target'));
            
            thisId = e.get('target').properties.get('id');
            that.readLocalStorage(thisId)
            that.openBalloon(e.get('target').geometry.getCoordinates(), tmp);
        });
        this.myMap.geoObjects.add(myPlacemark);
        this.clusterer.add(myPlacemark);
        this.writeLocalStorage(idMark, review);
        view.clearFields(review);
    },
    coordFormat(pointX, pointY) { //преобразование координат
        return [+pointX.toPrecision(6), +pointY.toPrecision(6)];
    },
    geocodeAddress(coords) { // поиск населенного пункта по координатам
        return ymaps.geocode(coords).then(address => {
            return address.geoObjects.get(0).getAddressLine();
        });
    },
    checkFullness(...review) { //проверка полей на пустоту
        for (let i of review) {
            if (!i) {
                return false;
            } 
        }

        return true;
    },
    writeLocalStorage(id, review) { 
        let markerData = [];
        if (objGlobRev[id]) {
            markerData = objGlobRev[id].reviews;   
        }

        markerData.push({
            name : review.feedbackName.value,
            place : review.feedbackPlace.value,
            message : review.feedbackMessage.value,
            date : review.date
        });
        objGlobRev[id] = {reviews : markerData};
        console.log(objGlobRev);
        /*let asd = JSON.stringify(objGlobRev)
        console.log(JSON.parse(asd)); */
    },
    readLocalStorage(id) { 
        let sss = view.renderReviews(objGlobRev[id].reviews,'reviews');
        console.log(sss);  
        console.log(objGlobRev[id].reviews[0]);  
    }
};