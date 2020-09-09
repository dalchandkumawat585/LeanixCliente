import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { faTrash, faCheck, faExpand, faEdit, faCompress } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  faTrash = faTrash;
  faCheck = faCheck;
  faExpand = faExpand;
  faEdit = faEdit;
  faCompress = faCompress;
  success = false;
  error = false;
  expand =false;
  constructor(private modalService: NgbModal, private http: HttpClient) { 
    this.getTags();
    this.getTodos();
    this.noOfTasks = 1;
  }
  noOfTasks;
  noOfTasksEdit;
  tags:any;
  todos:any;
  currentTodo:any;
  currentTodo1:any;
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
  closeTodo() {
    this.noOfTasks = 1;
  }
  getTags(){
    this.http.get('/todos/tags').subscribe(responseData=>{
      this.tags = responseData;
    });
  }
  getTodos(){
    this.http.get('todos').subscribe(responseData=>{
      this.todos=responseData;
    })
  }
  savetag(tagName: string, tagDescription: string) {
    this.http.post('/todos/tags', { name: tagName, description: tagDescription })
      .subscribe(responseData => {
        if (responseData['id']) {
          this.getTags();
          this.successToast();
        }
        else {
          this.errorToast();
        }
      })
  }

  savetodo(todoForm: NgForm) {
    let todo = {}
    todo['name']=todoForm['name0'];
    todo['description']=todoForm['description0'];
    if(todoForm['duedate0'])
      todo['date']=todoForm['duedate0'];
    if(todoForm['status0'])
      todo['status']=todoForm['status0'];
    todo['tag'] = this.tags.find(tag=>tag['id']===todoForm['tag0']);
    todo['sub']=[];
    for (let i = 1; i < this.noOfTasks; i+=4) {
      let subTask={};
      subTask['name']=todoForm['name'+i];
      subTask['description']=todoForm['description'+i];
      if(todoForm['duedate'+i])
        subTask['date']=todoForm['duedate'+i];
      if(todoForm['status'+i])
        subTask['status']=todoForm['status'+i];
      subTask['tag'] = this.tags.find(tag=>tag['id']===todoForm['tag'+i]);
      todo['sub'].push(subTask);
    }
    this.http.post('/todos',todo).subscribe(responseData=>{
      if(responseData['id']){        
        this.getTodos();
        this.successToast();
      }
      else{
        this.errorToast();
      }
    })
    this.noOfTasks = 1;
  }

  copyToEdit(todo){
    this.noOfTasksEdit=todo.sub.length+1;
    this.http.get('/todos/'+todo['id']).subscribe(responseData=>{
      (<HTMLInputElement>document.getElementsByName('name0')[0]).value = responseData['name'];
      (<HTMLInputElement>document.getElementsByName('description0')[0]).value=responseData['description'];
      (<HTMLInputElement>document.getElementsByName('duedate0')[0]).value=responseData['date'];
      (<HTMLInputElement>document.getElementsByName('status0')[0]).value=responseData['status'];
      (<HTMLInputElement>document.getElementsByName('tag0')[0]).value=responseData['tag']['id'];
      for(let i=1; i<this.noOfTasksEdit; i++){
        (<HTMLInputElement>document.getElementsByName('name'+i)[0]).value = responseData['sub'][i-1]['name'];
        (<HTMLInputElement>document.getElementsByName('description'+i)[0]).value=responseData['sub'][i-1]['description'];
        (<HTMLInputElement>document.getElementsByName('duedate'+i)[0]).value=responseData['sub'][i-1]['date'];
        (<HTMLInputElement>document.getElementsByName('status'+i)[0]).value=responseData['sub'][i-1]['status'];
        (<HTMLInputElement>document.getElementsByName('tag'+i)[0]).value=responseData['sub'][i-1]['tag']['id'];
      }
    })
  }

  editTodo(todoFormEdit:NgForm,id){    
    let todo = {}
    todo['name']=(<HTMLInputElement>document.getElementsByName('name0')[0]).value;
    todo['description']=(<HTMLInputElement>document.getElementsByName('description0')[0]).value;
    if((<HTMLInputElement>document.getElementsByName('duedate0')[0]).value)
      todo['date']=(<HTMLInputElement>document.getElementsByName('duedate0')[0]).value;
    if((<HTMLInputElement>document.getElementsByName('status0')[0]).value)
      todo['status']=(<HTMLInputElement>document.getElementsByName('status0')[0]).value;
    todo['tag'] = this.tags.find(tag=>tag['id']===(<HTMLInputElement>document.getElementsByName('tag0')[0]).value);
    todo['sub']=[];
    for (let i = 1; i < this.noOfTasks; i+=4) {
      let subTask={};
      subTask['name']=(<HTMLInputElement>document.getElementsByName('name'+i)[0]).value;
      subTask['description']=(<HTMLInputElement>document.getElementsByName('description'+i)[0]).value;
      if((<HTMLInputElement>document.getElementsByName('duedate'+i)[0]).value)
        subTask['date']=(<HTMLInputElement>document.getElementsByName('duedate'+i)[0]).value;
      if((<HTMLInputElement>document.getElementsByName('status'+i)[0]).value)
        subTask['status']=(<HTMLInputElement>document.getElementsByName('status'+i)[0]).value
      subTask['tag'] = this.tags.find(tag=>tag['id']===(<HTMLInputElement>document.getElementsByName('tag'+i)[0]).value);
      todo['sub'].push(subTask);
    }
    this.http.put('/todos/'+id,todo).subscribe(responseData=>{
      this.getTodos();
      this.successToast();
    },error=>{
      this.errorToast();
    })
    this.noOfTasksEdit = 1;
    this.currentTodo=null;
  }
  
  assignTag(todo,id){
    this.http.post('/todos/assigntag?id='+id,todo).subscribe(responseData=>{
      this.successToast();
      this.getTodos();
    },err=>{
      this.errorToast();
    })
  }

  markcomplete(todo){
    this.http.post('/todos/markcomplete',todo).subscribe(responseData=>{
      this.successToast();
      this.getTodos();
    },err=>{
      this.errorToast();
    })
  }
  
  delete(todo){
    this.http.delete('/todos/'+todo['id']).subscribe(responseData=>{
      this.successToast();
      this.getTodos();
      this.currentTodo = null;
    },err=>{
      this.errorToast();
    })
  }

  updateStatus(){
    this.http.post('/todos/updatestatus',{}).subscribe(responseData=>{
      this.successToast();
      this.getTodos();
    },err=>{
      this.errorToast();
    })
  }
  
  successToast(){
    this.success = true;
    setTimeout(()=>this.success = false,2000);
  }

  errorToast(){
    this.error = true;
    setTimeout(()=>this.error = false,2000);
  }
  hide(){
    setTimeout(()=>this.currentTodo1=null,0);
  }
}
