$(document).ready(function() {
   
    //Mocking Ajax since it doesn't allow requests to file protocol

    function AjaxMock(errorMessage, timeout) {
        this.errorCall = function() {
            return JSON.stringify({
                status:"error",
                reason: errorMessage || "Validation errors"
            });
        }

        this.successCall = function() {
            return JSON.stringify({
                status: "success"
            });
        }

        this.progressCall = function() {
            return JSON.stringify({
                status: "progress",
                timeout: timeout || 1000
            })
        }
    }

    const ajaxMock = new AjaxMock();




});