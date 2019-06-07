'use strict';

var form = document.getElementById('start-order-form');

function saveOrder() {
    var encryptedStudentId = document.getElementById('encryptedStudentId').value;
    var studentStatus = document.getElementById('studentStatus').value;

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