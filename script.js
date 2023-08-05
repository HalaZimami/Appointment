let DB;
const table = document.querySelector('tbody');
const form = document.querySelector('form');
const fname1 = document.querySelector('#fname');
const lname1 = document.querySelector('#lname');
const email1 = document.querySelector('#email');
const date1 = document.querySelector('#date');
const time1 = document.querySelector('#time');
const subject1 = document.querySelector('#subject');
const symptoms1 = document.querySelector('#symptoms');
const submit = document.querySelector('.book');

document.addEventListener('DOMContentLoaded', () => {
    // create the database
    let ScheduleDB = window.indexedDB.open('appointments_DB', 1);

    // if there's an error
    ScheduleDB.onerror = function () {
        console.log('error');
    }
    // if everything is fine, assign the result is to the (letDB) instance 
    ScheduleDB.onsuccess = function () {
        // console.log('Database Ready');


        DB = ScheduleDB.result;

        showConsultations();
    }


    ScheduleDB.onupgradeneeded = function (e) {

        let DB = e.target.result;

        let objectStore = DB.createObjectStore('appointment_tb', { keyPath: 'key', autoIncrement: true });


        objectStore.createIndex('fname', 'fname', { unique: false });
        objectStore.createIndex('lname', 'lname', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('time', 'time', { unique: false });
        objectStore.createIndex('subject', 'subject', { unique: false });
        objectStore.createIndex('symptoms', 'symptoms', { unique: false });

        //console.log('Database ready and fields created!');
    }

    form.addEventListener('submit', addConsultations);

    function addConsultations(e) {
        e.preventDefault();
        let newConsultation = {
            firstName: fname1.value,
            lastName: lname1.value,
            email: email1.value,
            date: date1.value,
            time: time1.value,
            subject: subject1.value,
            symptoms: symptoms1.value
        }

        let transaction = DB.transaction(['appointment_tb'], 'readwrite');
        let objectStore = transaction.objectStore('appointment_tb');

        let request = objectStore.add(newConsultation);
        request.onsuccess = () => {
            form.reset();
        }
        transaction.oncomplete = () => {
            document.querySelector('.success').innerHTML=`Appointment Booked successfully`
            showConsultations();
        }
        transaction.onerror = () => {
        }

    }
    function showConsultations() {

        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        let objectStore = DB.transaction('appointment_tb').objectStore('appointment_tb');

        objectStore.openCursor().onsuccess = function (e) {

            let cursor = e.target.result;
            if (cursor) {
                let ConsultationHTML = document.createElement('tr');
                ConsultationHTML.setAttribute('data-consultation-id', cursor.value.key);
                // ConsultationHTML.classList.add('list-group-item');


                ConsultationHTML.innerHTML = `  
            <td>${cursor.value.firstName} ${cursor.value.lastName}</td>
            <td>${cursor.value.subject}</td>
            <td>${cursor.value.date}</td>
            <td>${cursor.value.time}</td>
            <td><span class="badge badge-success rounded-pill d-inline">Confirmed</span></td>
            `;

                const cancelBtn = document.createElement('td');
                cancelBtn.classList.add('text-danger','cancel');
                cancelBtn.innerHTML = 'Cancel';
                cancelBtn.style.cursor='pointer'
                cancelBtn.onclick = removeConsultation;

                ConsultationHTML.appendChild(cancelBtn);
                table.appendChild(ConsultationHTML);

                cursor.continue();
            } else {
                if (!table.firstChild) {
                    services.textContent = 'Change your visiting hours';
                    let noSchedule = document.createElement('p');
                    noSchedule.classList.add('text-center');
                    noSchedule.textContent = 'No results Found';
                    table.appendChild(noSchedule);
                } else {
                    services.textContent = 'Your appointments'
                }
            }
        }
    }
    function removeConsultation(e) {

        let scheduleID = Number(e.target.parentElement.getAttribute('data-consultation-id'));

        let transaction = DB.transaction(['appointment_tb'], 'readwrite');
        let objectStore = transaction.objectStore('appointment_tb');

        objectStore.delete(scheduleID);

        transaction.oncomplete = () => {

            e.target.parentElement.parentElement.removeChild(e.target.parentElement);

            if (!table.firstChild) {
                let noSchedule = document.createElement('p');

                noSchedule.classList.add('text-center');

                noSchedule.textContent = 'No appointments Found';

                table.appendChild(noSchedule);
            } else {
                services.textContent = 'Your appointments'
            }
        }
    }
});