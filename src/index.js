import model from './modules/model.js';
import view from './modules/view.js';
import controller from './modules/controller.js';

new Promise(resolve => ymaps.ready(resolve))
    .then(() => {
        controller.myMap = new ymaps.Map('map', {
            center: [55.76, 37.64], // Москва
            zoom: 7
        });

        const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
                '<a data-id-mark="{{ properties.id|raw }}" class=ballon_body>{{ properties.balloonContentBody|raw }}</a>' +
                '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
        );

        controller.clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: customItemContentLayout,
            clusterBalloonPagerSize: 5,
            clusterDisableClickZoom: true
            //openBalloonOnClick: false
        });

        controller.myMap.geoObjects.add(controller.clusterer);
     
        //$[properties.balloonContent]

        let tmpBalloon = ymaps.templateLayoutFactory.createClass(
            view.renderForm('form-review')
        );

        controller.myMap.events.add('click', function (e) {
            //console.log(e.get('target'));
            let coords = e.get('coords');
            
            controller.openBalloon(coords, tmpBalloon);
            controller.thisId = 0;
        });
        
        document.addEventListener('click', function (e){
            if (e.target.getAttribute('data-action') === 'add') {
                const objFields = {
                    feedbackName : document.querySelector('.map-feedback-name'),
                    feedbackPlace : document.querySelector('.map-feedback-place'),
                    feedbackMessage : document.querySelector('.map-feedback-message'),
                    date : new Date()
                };
                let coords = controller.myMap.balloon.getPosition();
                let checkEmpty = controller.checkFullness(
                    objFields.feedbackName.value, 
                    objFields.feedbackPlace.value
                );
  
                if (!checkEmpty) {
                    alert('заполнены не все поля');
                } else {
                    controller.addMarker(coords, tmpBalloon, objFields); 
                }
                   
            } else if (e.target.getAttribute('data-action') === 'close') {
                controller.myMap.balloon.close();
            }
        });

        //return friends.items;
    })

