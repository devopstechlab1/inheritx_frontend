import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../item';
import { environment } from '../../environments/environment';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  todoForm: FormGroup;

  items: Item[] = [];
  done: Item[] = [];
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
    });
    this.http
      .get(environment.BASE_URL + '/get')
      .toPromise()
      .then((res: any) => {
        this.items = res.data.filter(
          (item: any) => !item.isDeleted && !item.done
        );
        this.done = res.data.filter((item: any) => item.done);
      });
  }

  addItem(description: string) {
    this.http
      .post(environment.BASE_URL + '/add', { description })
      .toPromise()
      .then((res: any) => {
        this.items.unshift(res.data);
      });
  }

  deleteItem(id: any) {
    this.http
      .post(environment.BASE_URL + '/delete', { id })
      .toPromise()
      .then((res) => {
        this.items.splice(
          this.items.findIndex((e) => e.id === id),
          1
        );
      });
  }

  deleteDoneItem(item: any) {
    this.done.splice(item, 1);
  }

  drop(event: CdkDragDrop<Item[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.http
        .post(environment.BASE_URL + '/update', {
          id: event.container.data[event.currentIndex].id,
          done: !event.container.data[event.currentIndex].done,
        })
        .toPromise()
        .then((res) => {});
    }
  }
}
