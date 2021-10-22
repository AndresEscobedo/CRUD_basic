import app from "../scripts/index.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";

const db = getFirestore(app);

const taskForm = document.querySelector("#task-form");
const taskContainer = document.getElementById("task-container");

let editStatus = false;
let id = "";

const saveTask = (title, desc) =>
  addDoc(collection(db, "tasks"), {
    title,
    desc
  });

const getTasks = () => getDocs(collection(db, "tasks"));

const onGetTask = (callback) => onSnapshot(collection(db, "tasks"), callback);

const deleteTask = (id) => deleteDoc(doc(db, "tasks", id));

const getTask = (id) => getDoc(doc(db, "tasks", id));

const updateTask = (id, updatedTask) =>
  updateDoc(doc(db, "tasks", id), updatedTask);

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = taskForm["task-title"];
  const desc = taskForm["task-description"];

  if (!editStatus) {
    await saveTask(title.value, desc.value);
  } else {
    await updateTask(id, { title: title.value, desc: desc.value });
    editStatus = false;
    id = "";
    taskForm["btn-task-form"].innerText = "Save";
  }

  getTasks();
  taskForm.reset();
  title.focus();

  //console.log(title.value, desc.value);
});

window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTask((querySnapshot) => {
    taskContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const task = doc.data();
      task.id = doc.id;
      taskContainer.innerHTML += `
        <div class="card card-body mt-2 border-primary">
          <h3 class="h5"> 
            ${task.title}
          </h3>
          <p> ${task.desc} </p>
          <div>
            <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
            <button class="btn btn-secondary btn-edit" data-id="${task.id}">Edit</button>
          </div>
        </div>
      `;

      const btnDelete = document.querySelectorAll(".btn-delete");

      btnDelete.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          await deleteTask(e.target.dataset.id);
        });
      });

      const btnEdit = document.querySelectorAll(".btn-edit");
      btnEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const doc = await getTask(e.target.dataset.id);
          const task = doc.data();

          editStatus = true;
          id = doc.id;
          taskForm["btn-task-form"].innerText = "Update";
          taskForm["task-title"].value = task.title;
          taskForm["task-description"].value = task.desc;
        });
      });
    });
  });
});
