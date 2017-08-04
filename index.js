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

        this.call = function() {
            var functions = [this.errorCall, this.successCall, this.progressCall];
            return functions[Math.floor(Math.random() * functions.length)]();
        }
    }

    ajaxMock = new AjaxMock();

    // Form object
    MyForm = {
        getData: function() {
            var resObj = {};

            formInputs.each(function() {
                var inputName = $(this).prop('name');
                var inputValue = $(this).prop('value');

                resObj[inputName] = inputValue;
            });

            return resObj;
        },
        setData: function(formData) {
            formInputs.each(function() {
                var inputName = $(this).prop('name');
                var newValue = formData[inputName];

                $(this).prop('value', newValue);
            });
        },
        validate: function() {
            var errors = [];

            var email = findInputByName('email').prop('value');
            var phone = findInputByName('phone').prop('value');
            var fullName = findInputByName('fio').prop('value');
            
            var validatedEmail = validateEmail(email);
            var validatedPhoneNumber = validatePhoneNumber(phone);
            var validatedFullName = validateFullName(fullName);

            var emailErrors = validatedEmail.errors;
            var phoneErrors = validatedPhoneNumber.errors;
            var fullNameErrors = validatedFullName.errors;


            return {
                isValid: validatedEmail.isValid && validatedFullName.isValid && validatedPhoneNumber.isValid,
                errorFields: errors.concat(emailErrors, phoneErrors, fullNameErrors)
            }
        },
        submit: function() {
            var validateInputs = this.validate();
            var that = this;
            
            resetErrorClass();
            resetResultContainer();



            if(validateInputs.isValid) {
                submitButton.prop('disabled', true);

                loaderSVG.show();

                ajaxMock.call().then(function(res) {
                    res = JSON.parse(res);

                    switch (res.status) {
                        case 'success':
                            setTimeout(function() {
                                $('#resultContainer').addClass('success').append('Success');
                                submitButton.prop('disabled', false);
                                loaderSVG.hide();
                            }, 1000);
                            break;
                        case 'error':
                            setTimeout(function() {
                                $('#resultContainer').addClass('error').append(res.reason);
                                submitButton.prop('disabled', false);
                                loaderSVG.hide();
                            }, 1000);
                            break;
                        case 'progress':
                            $('#resultContainer').addClass('progress').append('Progress');
                            setTimeout(function() {
                                that.submit();
                            }, res.timeout);
                            break;
                        default: 
                            throw Error('Not supported response status');
                    } 
                });
            } else {
                addErrorClass(validateInputs.errorFields);
            }
        }
    };

    var formInputs = $('#main-form').find('div input');

    validateFullName = function(fullName) {
        var res = {
            isValid: false,
            errors: []
        }

        fullName = fullName.trim();

        if(fullName.length < 1 || !fullName.split(' ').length === 3) {
            res.isValid = false;
            res.errors.push('fio');
        } else {
            res.isValid = true
        }

        return res;
    }

    var validatePhoneNumber = function(phoneNumber) {
        var sum = sumDigits(phoneNumber);
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
    }

    var validateEmail = function(email) {
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
    }

    var findInputByName = function(name) {
        return $(formInputs.filter(function(index, input) {
            return $(input).prop('name') === name;
        })[0]);
    }

    var sumDigits = function(strNumber) {
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

    var addErrorClass = function(fields) {
        fields.forEach(function(field) {
            findInputByName(field).parent().addClass('has-danger');
        });
    }
    var resetErrorClass = function() {
        formInputs.each(function(index, input) {
            $(input).parent().removeClass('has-danger');
        });
    }

    var resetResultContainer = function() {
        $('#resultContainer').removeClass('error success progress').empty();
    }

    var submitButton = $('#submit-button');
    var loaderSVG = $('.loader');
    
    submitButton.click(function(e) {
        e.preventDefault();
        MyForm.submit();
    });
});