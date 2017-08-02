$(document).ready(function() {
    MyForm = {
        formInputs: $('#main-form').find('div input'),
        getData: function() {
            var resObj = {};

            formInputs.each(function(index, input) {
                var inputName = $(input).prop('name');
                var inputValue = $(input).prop('value');

                resObj[inputName] = inputValue;
            });

            return resObj;
        }
    };
    //Mocking Ajax since it doesn't allow requests to file protocol
    function AjaxMock(errorMessage, timeout) {
        this.errorCall = function() {
            return new Promise(function(resolve, reject) {
                var response = JSON.stringify({
                    status:"error",
                    reason: errorMessage || "Validation errors"
                });

                resolve(response);
            });

        }

        this.successCall = function() {
            return new Promise(function(resolve, reject) {
                var response = JSON.stringify({
                    status: "success"
                });

                resolve(response);
            });
        }

        this.progressCall = function() {
            return new Promise(function(resolve, reject) {
                var response = JSON.stringify({
                    status: "progress",
                    timeout: timeout || 1000
                });

                resolve(response);
            });
        }
    }

    const ajaxMock = new AjaxMock();

    var submitButton = $('#submit-button');

    submitButton.click(function(e) {
        e.preventDefault();
        var actions = $('#actions').find('div input');

        var selectedAction = actions.filter(function(index, action) {
            return $(action).prop('checked');
        })[0];

        switch($(selectedAction).prop('value')) {
            case 'error': 
                ajaxMock.errorCall().then(function(res) {
                    console.log(res);
                });

                break;
            case 'success':
                ajaxMock.successCall().then(function(res) {
                    console.log(res);
                });

                break;
            case 'progress': 
                ajaxMock.progressCall().then(function(res) {
                    console.log(res);
                });

                break;
            default: 
                throw Error('No action specified');
        }
    });
});