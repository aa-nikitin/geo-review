let storage = localStorage;

export default {
    setLocalStorage(friendsFavorite) { // сохраняем в localStorage
        if (Object.keys(friendsFavorite).length > 0) {
            storage.georeview = JSON.stringify(friendsFavorite);
        } else {
            storage.georeview = '';    
        }
    },
    getLocalStorage() { // загружаем из localStorage
        return storage.georeview ? JSON.parse(storage.georeview) : {};  
    }
};