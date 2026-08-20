// ========================================
// ระบบยืม-คืนกุญแจแผนก
// ========================================


// URL Google Apps Script

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxrn45dWt_sYU6Cw5fbWJzdvylfiA8T6g_x-3cjhQ_jLkZMpbWaaPeUxWkgLj-YAsSEKg/exec";


// โหลดข้อมูลที่เก็บไว้ในเครื่อง

let data =
    JSON.parse(
        localStorage.getItem("keyData")
    ) || [];


// ========================================
// บันทึกข้อมูล
// ========================================

async function saveData() {

    const name =
        document.getElementById("name").value.trim();

    const studentId =
        document.getElementById("studentId").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const level =
        document.getElementById("level").value;

    const room =
        document.getElementById("room").value;

    const action =
        document.getElementById("action").value;


    // ตรวจสอบข้อมูล

    if (
        name === "" ||
        studentId === "" ||
        email === "" ||
        level === "" ||
        room === "" ||
        action === ""
    ) {

        alert(
            "กรุณากรอกข้อมูลให้ครบถ้วน"
        );

        return;
    }


    // ตรวจสอบรูปแบบอีเมล

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert(
            "กรุณากรอกอีเมลให้ถูกต้อง"
        );

        return;
    }


    // ตรวจสอบห้องที่กำลังถูกยืม

    const borrowers =
        getCurrentBorrowers();


    const alreadyBorrowed =
        borrowers.find(function(item) {

            return item.room === room;

        });


    // ถ้าจะยืม แต่ห้องถูกยืมอยู่แล้ว

    if (
        action === "ยืม" &&
        alreadyBorrowed
    ) {

        alert(
            "ห้อง " +
            room +
            " กำลังถูกยืมโดย " +
            alreadyBorrowed.name
        );

        return;
    }


    // ถ้าจะคืน แต่ไม่มีผู้ยืม

    if (
        action === "คืน" &&
        !alreadyBorrowed
    ) {

        alert(
            "ห้อง " +
            room +
            " ยังไม่มีผู้ยืม"
        );

        return;
    }


    // วันที่และเวลา

    const now =
        new Date();

    const date =
        now.toLocaleString("th-TH");


    // ข้อมูล

    const record = {

        name: name,

        studentId: studentId,

        email: email,

        level: level,

        room: room,

        action: action,

        date: date

    };


    // ========================================
    // ส่งข้อมูลไป Google Sheets
    // ========================================

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

                body:
                    JSON.stringify(record)

            }

        );


        // เก็บข้อมูลในเครื่อง

        data.push(record);


        localStorage.setItem(

            "keyData",

            JSON.stringify(data)

        );


        // แจ้งเตือน

        if (action === "ยืม") {

            alert(
                "✅ ยืมกุญแจเรียบร้อยแล้ว"
            );

        } else {

            alert(
                "✅ คืนกุญแจเรียบร้อยแล้ว"
            );

        }


        // ล้างแบบฟอร์ม

        document.getElementById(
            "name"
        ).value = "";


        document.getElementById(
            "studentId"
        ).value = "";


        document.getElementById(
            "email"
        ).value = "";


        document.getElementById(
            "level"
        ).value = "";


        document.getElementById(
            "room"
        ).value = "";


        document.getElementById(
            "action"
        ).value = "";


        // แสดงข้อมูล

        showData();

    }

    catch (error) {

        console.error(error);

        alert(
            "เกิดข้อผิดพลาดในการเชื่อมต่อ"
        );

    }

}


// ========================================
// หาผู้ที่กำลังยืม
// ========================================

function getCurrentBorrowers() {

    let borrowers = [];


    data.forEach(function(item) {

        const index =
            borrowers.findIndex(
                function(person) {

                    return person.room === item.room;

                }
            );


        if (index !== -1) {

            borrowers.splice(
                index,
                1
            );

        }


        if (item.action === "ยืม") {

            borrowers.push(item);

        }

    });


    return borrowers;

}


// ========================================
// แสดงผู้ที่กำลังยืม
// ========================================

function showBorrowers() {

    const table =
        document.getElementById(
            "borrowTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    const borrowers =
        getCurrentBorrowers();


    // จำนวน

    document.getElementById(
        "borrowed"
    ).innerText =
        borrowers.length;


    document.getElementById(
        "available"
    ).innerText =
        Math.max(
            0,
            9 - borrowers.length
        );


    // ไม่มีผู้ยืม

    if (borrowers.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty"
                >

                    🟢 ขณะนี้ไม่มีกุญแจถูกยืม

                </td>

            </tr>

        `;

        return;
    }


    // แสดงข้อมูล

    borrowers.forEach(
        function(item, index) {

            const row =
                table.insertRow();


            row.insertCell(0).innerText =
                index + 1;


            row.insertCell(1).innerText =
                item.name;


            row.insertCell(2).innerText =
                item.studentId;


            row.insertCell(3).innerText =
                item.level;


            row.insertCell(4).innerText =
                item.room;


            row.insertCell(5).innerText =
                item.date;


            row.insertCell(6).innerHTML =

                `
                <span class="borrow">
                    กำลังยืม
                </span>
                `;

        }
    );

}


// ========================================
// แสดงประวัติ
// ========================================

function showData() {

    const table =
        document.getElementById(
            "dataTable"
        );


    if (!table) {

        showBorrowers();

        return;
    }


    table.innerHTML = "";


    data.forEach(
        function(item, index) {

            const row =
                table.insertRow();


            row.insertCell(0).innerText =
                index + 1;


            row.insertCell(1).innerText =
                item.name;


            row.insertCell(2).innerText =
                item.studentId;


            row.insertCell(3).innerText =
                item.level;


            row.insertCell(4).innerText =
                item.room;


            if (
                item.action === "ยืม"
            ) {

                row.insertCell(5).innerHTML =

                    `
                    <span class="borrow">
                        ยืมกุญแจ
                    </span>
                    `;

            }

            else {

                row.insertCell(5).innerHTML =

                    `
                    <span class="return">
                        คืนกุญแจ
                    </span>
                    `;

            }


            row.insertCell(6).innerText =
                item.date;

        }
    );


    showBorrowers();

}


// ========================================
// ปุ่มบันทึก
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        document.getElementById(
            "saveBtn"
        ).addEventListener(
            "click",
            saveData
        );


        showData();

    }
);
