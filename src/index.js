import view from './modules/view.js';
import controller from './modules/controller.js';

new Promise(resolve => ymaps.ready(resolve))
    .then(() => {
        controller.myMap = new ymaps.Map('map', {
            center: [55.76, 37.64], // Москва
            zoom: 7
        });

        const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            view.render('balloon-review')
        );

        const tmpBalloon = ymaps.templateLayoutFactory.createClass(
            view.render('form-review')
        );

        controller.myMap.cursors.push('pointer');

        controller.clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: customItemContentLayout,
            clusterBalloonPagerSize: 5,
            clusterDisableClickZoom: true
        });

        controller.myMap.geoObjects.add(controller.clusterer);

        controller.readLocalStorage(tmpBalloon);

        controller.myMap.events.add('click', function (e) {
            let coords = e.get('coords');
            
            controller.openBalloon(coords, tmpBalloon);
        });
        
        document.addEventListener('click', function (e){
            if (e.target.getAttribute('data-action') === 'add') {
                const objFields = {
                    feedbackName : document.querySelector('.map-feedback-name'),
                    feedbackPlace : document.querySelector('.map-feedback-place'),
                    feedbackMessage : document.querySelector('.map-feedback-message'),
                    date : new Date().toLocaleString("ru", controller.formatDate)
                };
                const tmpReviews = document.querySelector('.map-popup__reviews');
                let coords = controller.myMap.balloon.getPosition();
                let checkEmpty = controller.checkFullness(
                    objFields.feedbackName.value, 
                    objFields.feedbackPlace.value,
                    objFields.feedbackMessage.value
                );
  
                if (!checkEmpty) {
                    alert('заполнены не все поля');
                } else {
                    controller.createMarker(coords, tmpBalloon, objFields);
                    tmpReviews.innerHTML = controller.refreshReviews();  
                }      
            } else if (e.target.getAttribute('data-action') === 'close') {
                controller.closeForm();
            } else if (e.target.getAttribute('data-action') === 'open-link') {
                let idMarker = e.target.getAttribute('data-id-mark');

                controller.loadMarkers(idMarker, tmpBalloon);
            }
        });
    });