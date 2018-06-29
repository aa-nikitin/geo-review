export default {
    render(templateName, data) { // шаблон формы
        const template = document.getElementById(templateName).textContent;
        const render = Handlebars.compile(template);
        const html = data ? render(data) : render();

        return html;
    },
    clearFields(formFields) { // очищаем поля
        for (let i in formFields) {
            if ( i !== 'date' ) {
                formFields[i].value = '';
            }
            
        }
    }
};