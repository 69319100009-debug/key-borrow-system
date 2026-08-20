let data = JSON.parse(localStorage.getItem("keyData")) || [];

function saveData() {

    let name = document.getElementById("name").value;
    let studentId = document.getElementById("studentId").value;
    let level = document.getElementById("level").value;
    let room = document.getElementById("room").value;
    let action = document.getElementById("action").value;

    if (
        name == "" ||
        studentId == "" ||
        level == "" ||
        room == ""
    ) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    let current = getCurrentBorrowers();

    let alreadyBorrowed = current.find(function(item) {
        return item.room == room;
    });

    if (action == "ยืม" && alreadyBorrowed) {
        alert("ห้องนี้กำลังถูกยืมโดย " + alreadyBorrowed.name);
        return;
    }

    if (action == "คืน" && !alreadyBorrowed) {
        alert("ห้องนี้ยังไม่มีผู้ยืม");
        return;
    }

    let date = new Date().toLocaleString("th-TH");

    let record = {
        name: name,
        studentId: studentId,
        level: level,
        room: room,
        action: action,
        date: date
    };

    data.push(record);

    localStorage.setItem("keyData", JSON.stringify(data));

    alert("บันทึกข้อมูลเรียบร้อยแล้ว");

    document.getElementById("name").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("level").value = "";
    document.getElementById("room").value = "";

    showData();
}

function getCurrentBorrowers() {

    let borrowers = [];

    data.forEach(function(item) {

        let old = borrowers.find(function(person) {
            return person.room == item.room;
        });

        if (old) {
            borrowers = borrowers.filter(function(person) {
                return person.room != item.room;
            });
        }

        if (item.action == "ยืม") {
            borrowers.push(item);
        }

    });

    return borrowers;
}

function showBorrowers() {

    let table = document.getElementById("borrowTable");

    table.innerHTML = "";

    let borrowers = getCurrentBorrowers();

    document.getElementById("borrowed").innerText =
        borrowers.length;

    document.getElementById("available").innerText =
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

    borrowers.forEach(function(item, index) {

        let row = table.insertRow();

        row.insertCell(0).innerHTML = index + 1;
        row.insertCell(1).innerHTML = item.name;
        row.insertCell(2).innerHTML = item.studentId;
        row.insertCell(3).innerHTML = item.level;
        row.insertCell(4).innerHTML = item.room;
        row.insertCell(5).innerHTML = item.date;

        row.insertCell(6).innerHTML =
            '<span class="borrow">กำลังยืม</span>';

    });
}

function showData() {

    let table = document.getElementById("dataTable");

    table.innerHTML = "";

    data.forEach(function(item, index) {

        let row = table.insertRow();

        row.insertCell(0).innerHTML = index + 1;
        row.insertCell(1).innerHTML = item.name;
        row.insertCell(2).innerHTML = item.studentId;
        row.insertCell(3).innerHTML = item.level;
        row.insertCell(4).innerHTML = item.room;

        if (item.action == "ยืม") {

            row.insertCell(5).innerHTML =
                '<span class="borrow">ยืมกุญแจ</span>';

        } else {

            row.insertCell(5).innerHTML =
                '<span class="return">คืนกุญแจ</span>';
        }

        row.insertCell(6).innerHTML = item.date;

    });

    showBorrowers();
}

showData();