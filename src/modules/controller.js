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

let objGlobRev = {};

class makingID {
    constructor(thisId, lastId) {
      this.thisId = thisId;
      this.lastId = lastId;
    }  
    updateId(id) {
        if (id) {
            this.thisId = id;
        } else {
            this.lastId++;
            this.thisId = this.lastId;
        }
    }  
}

let idMarker = new makingID(0, 0);



export default {
    openBalloon(coords, tmp, idReviews) { // открытие балуна
        if (!this.myMap.balloon.isOpen()) { 
            let reviews; 
            if (idReviews) {
                reviews = this.refreshReviews(objGlobRev[idReviews]);
            } else {
                reviews = 'Отзывов пока нет...';
            }
            this.geocodeAddress(coords).then(address => {
                this.myMap.balloon.open(coords, {
                    contentLayout: address,
                    contentReviews: reviews
                }, {
                    balloonShadow: false,
                    layout: tmp,
                    balloonPanelMaxMapArea: 0
                });
                this.addressMap = address;
            });
            idMarker.updateId(idReviews);
            //console.log(idMarker.thisId);
        } else {
            this.closeForm();
        }
    },
    addMarker(coords, tmp, review) { // создание метки  
        let that = this;  
        let idMark = idMarker.thisId;       
        let coordsPoint = this.coordFormat(coords[0], coords[1]);    
        let myPlacemark = new ymaps.Placemark(coordsPoint, {
            id: idMark,
            balloonContentHeader: `${review.feedbackPlace.value}`,
            balloonContentLink: `${this.addressMap}`,
            balloonContentBody: `${review.feedbackMessage.value}`,
            balloonContentFooter: `${review.date}`
        },{
            openBalloonOnClick: false
        });
        
        myPlacemark.events.add('click', function (e) { //событие при нажатии на метку
            let idPoint = e.get('target').properties.get('id');

            idMarker.updateId(idPoint);
            that.refreshReviews(objGlobRev[idPoint]);
            that.openBalloon(e.get('target').geometry.getCoordinates(), tmp, idPoint);
        });
        this.myMap.geoObjects.add(myPlacemark);
        this.clusterer.add(myPlacemark);
        this.writeLocalStorage(idMark, review, coords);
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
    writeLocalStorage(id, review, coords) { // пишем в объект и localStorage
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
        objGlobRev[id] = {
            reviews : markerData,
            coords : coords
        };
        //console.log(objGlobRev);
    },
    readLocalStorage(id, tmpBalloon) { // 
        this.myMap.balloon.close();
        this.openBalloon(objGlobRev[id].coords, tmpBalloon, id);
        //console.log(objGlobRev[id].coords);  
    },
    refreshReviews(data = objGlobRev[idMarker.thisId]) { // обновить отзывы
        return view.render('reviews', data); 
    },
    closeForm() { 
        this.myMap.balloon.close();
    }
};