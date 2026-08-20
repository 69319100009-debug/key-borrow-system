// URL ของ Google Apps Script
const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxrn45dWt_sYU6Cw5fbWJzdvylfiA8T6g_x-3cjhQ_jLkZMpbWaaPeUxWkgLj-YAsSEKg/exec";


// เก็บข้อมูลในเครื่อง
let data =
    JSON.parse(localStorage.getItem("keyData")) || [];


// บันทึกข้อมูล
async function saveData() {

    let name =
        document.getElementById("name").value;

    let studentId =
        document.getElementById("studentId").value;

    let level =
        document.getElementById("level").value;

    let room =
        document.getElementById("room").value;

    let action =
        document.getElementById("action").value;


    // ตรวจสอบข้อมูล
    if (
        name == "" ||
        studentId == "" ||
        level == "" ||
        room == ""
    ) {

        alert("กรุณากรอกข้อมูลให้ครบถ้วน");

        return;
    }


    // ตรวจสอบห้องที่กำลังยืม
    let current =
        getCurrentBorrowers();

    let alreadyBorrowed =
        current.find(function(item) {

            return item.room == room;

        });


    if (
        action == "ยืม" &&
        alreadyBorrowed
    ) {

        alert(
            "ห้องนี้กำลังถูกยืมโดย " +
            alreadyBorrowed.name
        );

        return;
    }


    if (
        action == "คืน" &&
        !alreadyBorrowed
    ) {

        alert("ห้องนี้ยังไม่มีผู้ยืม");

        return;
    }


    // วันที่และเวลา
    let date =
        new Date().toLocaleString("th-TH");


    // ข้อมูลที่จะส่งไป Google Sheets
    let record = {

        name: name,

        studentId: studentId,

        level: level,

        room: room,

        action: action,

        date: date
    };


    // ส่งข้อมูลไป Google Sheets
    try {

        await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify(record)
            }
        );


        // เก็บข้อมูลในเครื่องด้วย
        data.push(record);

        localStorage.setItem(
            "keyData",
            JSON.stringify(data)
        );


        alert(
            "บันทึกข้อมูลเรียบร้อยแล้ว"
        );


        // ล้างข้อมูล
        document.getElementById("name").value = "";

        document.getElementById("studentId").value = "";

        document.getElementById("level").value = "";

        document.getElementById("room").value = "";


        // แสดงข้อมูล
        showData();

    }

    catch (error) {

        console.error(error);

        alert(
            "ไม่สามารถเชื่อมต่อ Google Sheets ได้"
        );

    }

}


// หาผู้ที่กำลังยืม
function getCurrentBorrowers() {

    let borrowers = [];


    data.forEach(function(item) {

        let old =
            borrowers.find(function(person) {

                return person.room == item.room;

            });


        if (old) {

            borrowers =
                borrowers.filter(function(person) {

                    return person.room != item.room;

                });

        }


        if (item.action == "ยืม") {

            borrowers.push(item);

        }

    });


    return borrowers;
}


// แสดงผู้ที่กำลังยืม
function showBorrowers() {

    let table =
        document.getElementById(
            "borrowTable"
        );


    table.innerHTML = "";


    let borrowers =
        getCurrentBorrowers();


    document.getElementById(
        "borrowed"
    ).innerText =
        borrowers.length;


    document.getElementById(
        "available"
    ).innerText =
        9 - borrowers.length;


    if (borrowers.length == 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    🟢 ขณะนี้ไม่มีกุญแจถูกยืม
                </td>
            </tr>
        `;

        return;
    }


    borrowers.forEach(
        function(item, index) {

            let row =
                table.insertRow();


            row.insertCell(0).innerHTML =
                index + 1;


            row.insertCell(1).innerHTML =
                item.name;


            row.insertCell(2).innerHTML =
                item.studentId;


            row.insertCell(3).innerHTML =
                item.level;


            row.insertCell(4).innerHTML =
                item.room;


            row.insertCell(5).innerHTML =
                item.date;


            row.insertCell(6).innerHTML =
                '<span class="borrow">กำลังยืม</span>';

        }
    );
}


// แสดงประวัติ
function showData() {

    let table =
        document.getElementById(
            "dataTable"
        );


    table.innerHTML = "";


    data.forEach(
        function(item, index) {

            let row =
                table.insertRow();


            row.insertCell(0).innerHTML =
                index + 1;


            row.insertCell(1).innerHTML =
                item.name;


            row.insertCell(2).innerHTML =
                item.studentId;


            row.insertCell(3).innerHTML =
                item.level;


            row.insertCell(4).innerHTML =
                item.room;


            if (item.action == "ยืม") {

                row.insertCell(5).innerHTML =
                    '<span class="borrow">ยืมกุญแจ</span>';

            } else {

                row.insertCell(5).innerHTML =
                    '<span class="return">คืนกุญแจ</span>';

            }


            row.insertCell(6).innerHTML =
                item.date;

        }
    );


    showBorrowers();
}


// เริ่มระบบ
showData();
