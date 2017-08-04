$(document).ready(function() {
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

    MyForm = {
        formInputs: $('#main-form').find('div input'),
        getData: function() {
            var resObj = {};

            this.formInputs.each(function(index, input) {
                var inputName = $(input).prop('name');
                var inputValue = $(input).prop('value');

                resObj[inputName] = inputValue;
            });

            return resObj;
        },
        setData: function(formData) {
            this.formInputs.each(function(index, input) {
                var inputName = $(input).prop('name');
                var newValue = formData[inputName];

                $(input).prop('value', newValue);
            });
        },
        validate: function() {
            var errors = [];

            var email = this.findInputByName('email').prop('value');
            var phone = this.findInputByName('phone').prop('value');
            var fullName = this.findInputByName('fio').prop('value');
            
            var validatedEmail = this.validateEmail(email);
            var validatedPhoneNumber = this.validatePhoneNumber(phone);
            var validatedFullName = this.validateFullName(fullName);

            var emailErrors = validatedEmail.errors;
            var phoneErrors = validatedPhoneNumber.errors;
            var fullNameErrors = validatedFullName.errors;


            return {
                isValid: validatedEmail.isValid && validatedFullName.isValid && validatedPhoneNumber.isValid,
                errorFields: errors.concat(emailErrors, phoneErrors, fullNameErrors)
            }
        },
        submit: function() {
            if(this.validate().isValid) {
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
            } else {

            }
        },
        validateFullName: function(fullName) {
            var res = {
                isValid: false,
                errors: []
            }

            if(fullName.length < 1 || !fullName.split(' ').length === 3) {
                res.isValid = false;
                res.errors.push('fio');
            } else {
                res.isValid = true
            }

            return res;
        },
        validatePhoneNumber: function(phoneNumber, errors) {
            var sum = this.sumDigits(phoneNumber);
            var regex = /\+7\([1-9]{3}\)[1-9]{3}\-[1-9]{2}\-[1-9]{2}/;
            var res = {
                isValid: false,
                errors: []
            }
            
            if(sum > 30 || !regex.test(phoneNumber)) {
                res.isValid = false;
                res.errors.push('phone');
            } else {
                res.isValid = true;
            }

            return res;
        },
        validateEmail: function(email) {
            var regex = /^[^<>()\[\]\\.,;:\s@"]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?((yandex\.(com|ua|ru|kz|by))|(ya\.ru))$/;
            var res = {
                isValid: false,
                errors: []
            }

            if(!regex.test(email)) {
                res.isValud = false;
                res.errors.push('email');
            } else {
                res.isValid = true;
            }

            return res;
        },
        findInputByName: function(name) {
            return $(this.formInputs.filter(function(index, input) {
                return $(input).prop('name') === name;
            })[0]);
        },
        sumDigits: function(strNumber) {
            strNumber = strNumber.toString();
            if(strNumber.length === 0) {
                return NaN;
            }

            return strNumber
                .split('')
                .map(function(e){
                    var digit = parseInt(e);
                    if(!isNaN(digit)) {
                        return digit;
                    } else {
                        return 0;
                    }
                })
                .reduce(function(a, b){
                    return a + b;
                }); 
        }
    };

    var submitButton = $('#submit-button');
    submitButton.click(function(e) {
        e.preventDefault();
        MyForm.submit();
    });
});