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
        }
    },
    drawBalloon(coords, tmp, review) { // создание метки  
        let that = this;  
        
        let coordsPoint = this.coordFormat(coords[0], coords[1]);    
        let myPlacemark = new ymaps.Placemark(coordsPoint, {
            id: 123,
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
            //console.log(e.get('target').properties.get('iden'));
            that.openBalloon(e.get('target').geometry.getCoordinates(), tmp);
        });
        this.myMap.geoObjects.add(myPlacemark);
        this.clusterer.add(myPlacemark);
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
    checkFullness(...review) { //преобразование координат
        for (let i of review) {
            if (!i) {
                return false;
            } 
        }
        return true;
        
    }
};