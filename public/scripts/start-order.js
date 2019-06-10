'use strict';

var formElement = document.getElementById('start-order-form');
var encryptedStudentIdElement = document.getElementById('encryptedStudentId');
var studentStatusElements = document.getElementsByName('studentStatus');

function goToCheckout() {
    window.location.href = "/checkout";
}

function saveOrder(event) {
    event.preventDefault();

    var encryptedStudentId = encryptedStudentIdElement.value;

    for (var i = 0, length = studentStatusElements.length; i < length; i++) {
        if (studentStatusElements[i].checked) {
            var studentStatus = studentStatusElements[i].value;
            break;
        }
    }

    // TODO: Null checks.
  
    var order = {
        encrypted_student_id: encryptedStudentId,
        student_status: studentStatus
    };

    firebase
        .database()
        .ref('/transaction2')
        .update(order)
        .then(function() {
            goToCheckout();
        })
        .catch(function(error) {
            console.error('Error saving order to /transaction2', error);
            
            // DELETE BEFORE DEPLOYING.
            goToCheckout();
        });
}

formElement.addEventListener('submit', saveOrder);
