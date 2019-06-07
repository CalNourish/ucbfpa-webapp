'use strict';

var formElement = document.getElementById('start-order-form');
var encryptedStudentIdElement = document.getElementById('encryptedStudentId');
var studentStatusElement = document.getElementById('studentStatus');

function saveOrder(event) {
    event.preventDefault();

    var encryptedStudentId = encryptedStudentIdElement.value;
    var studentStatus = studentStatusElement.value;

    // TODO: Null checks.
  
    var order = {
        encrypted_student_id: encryptedStudentId,
        student_status: studentStatus
    };

    return firebase
        .database()
        .ref('/transaction2')
        .update(order)
        .catch(function(error) {
            console.error('Error saving order to /transaction2', error);
        });
}


formElement.addEventListener('submit', saveOrder);
