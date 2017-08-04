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
        formInputs: $('#main-form').find('div input'),
        getData: function() {
            var resObj = {};

            this.formInputs.each(function() {
                var inputName = $(this).prop('name');
                var inputValue = $(this).prop('value');

                resObj[inputName] = inputValue;
            });

            return resObj;
        },
        setData: function(formData) {
            this.formInputs.each(function() {
                var inputName = $(this).prop('name');
                var newValue = formData[inputName];

                $(this).prop('value', newValue);
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
            var validateInputs = this.validate();
            var that = this;
            
            this.resetErrorClass();
            this.resetResultContainer();

            if(validateInputs.isValid) {
                submitButton.prop('disabled', true);

                ajaxMock.call().then(function(res) {
                    res = JSON.parse(res);

                    switch (res.status) {
                        case 'success':
                            setTimeout(function() {
                                $('#resultContainer').addClass('success').append('Success');
                                submitButton.prop('disabled', false);
                            }, 1000);
                            break;
                        case 'error':
                            setTimeout(function() {
                                $('#resultContainer').addClass('error').append(res.reason);
                                submitButton.prop('disabled', false);
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
                this.addErrorClass(validateInputs.errorFields);
            }
        },
        validateFullName: function(fullName) {
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
        },
        addErrorClass: function(fields) {
            var that = this;

            fields.forEach(function(field) {
                that.findInputByName(field).parent().addClass('has-danger');
            });
        },
        resetErrorClass: function() {
            this.formInputs.each(function(index, input) {
                $(input).parent().removeClass('has-danger');
            });
        },
        resetResultContainer: function() {
            $('#resultContainer').removeClass('error success progress').empty();
        }
    };

    var submitButton = $('#submit-button');
    submitButton.click(function(e) {
        e.preventDefault();
        MyForm.submit();
    });
});