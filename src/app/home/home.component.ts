import {MatSnackBar} from '@angular/material';
import {Component, OnInit} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: '../html/home.html',
  styleUrls: ['../css/home.css']
})
export class HomeComponent implements OnInit {

  public message: string;

  asyncRes: Observable<any>;
  isMatchListLoaded: boolean;

  inputDate: string;
  inputText: string;

  // Prevent cache headers
  noCache() {
    let headers = new HttpHeaders();
    headers.append('Cache-Control', 'no-store, no-cache, no-transform, must-revalidate, max-age=0');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
    return headers;
  }

  constructor(private http: HttpClient, public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.message = 'Hello';
    this.getListMatched();
    this.inputText = '';
    this.inputDate= '';
  }

  // Date validator
  isSpecial(date) {
    var today = new Date(Date.now());
    var since = new Date(date);
    if (since > today) {
      return true;
    } else {
      return false;
    }
  }

  // Add item
  addItem() {
    if (this.inputText == '' || this.inputDate == '') {
      this.snackBar.open("Fill empty fields", '', {duration: 500});
      return;
    }
    if (this.inputText == '' && this.inputDate == '') {
      this.snackBar.open("All fields required", '', {duration: 500});
      return;
    } 
    this.http.post(
      'http://localhost:4000/api/v1/add',
      { noteText: this.inputText, noteDate: this.inputDate },
      {
        headers: this.noCache()
      }
    ).subscribe(resp => {
      this.getListMatched();
      this.inputText = '';
      this.inputDate= '';
    });

  }

  // Delete item
  deleteItem(item_id: number) {
    this.http.delete(
      'http://localhost:4000/api/v1/delete/'+item_id,
      {
        headers: this.noCache()
      }
    ).subscribe(resp => {
      this.getListMatched();
      this.inputText = '';
      this.inputDate= '';
    });
  }

  // Get http observable
  serverCallListObservable(): Observable<any> {
    return this.http.get(
      'http://localhost:4000/api/v1/get',
      {
        headers: this.noCache()
      }
    );
  }

  // Subscribe list
  getListMatched() {
    this.isMatchListLoaded = true;
    this.asyncRes = this.serverCallListObservable()
      .pipe(tap(res => {
          console.log(res);
          this.isMatchListLoaded = undefined;
      }), map(res => res));
  }
}