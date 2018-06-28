export default {
    renderForm(templateName) { // шаблон формы
        const template = document.getElementById(templateName).textContent;
        const render = Handlebars.compile(template);
        const html = render();
        
        return html;
    },
    renderReviews(data, templateName) { // шаблон формы
        const template = document.getElementById(templateName).textContent;
        const render = Handlebars.compile(template);
        const html = render(data);
        console.log(data);
        return html;
    },
    clearFields(formFields) { // очищаем поля
        for (let i in formFields) {
            formFields[i].value = '';
        }
    }
};