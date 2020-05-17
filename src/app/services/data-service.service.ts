import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { GlobalDataSummary } from '../models/global-data';
import { DateWiseData } from '../models/date-wise-date';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {


  private baseURL=`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/`
// Here we will fetch data from github of daily reports
  // Here we will get the url of the latest report on github
   private globalDataUrl=``;
 
  private extension = '.csv'
  month;
  date;
  year;

  getDate(date : number){
    //  here we will check if number is single digit
      if(date < 10){
        return '0'+date
      }
      return date;
    }


  private dateWiseDataUrl=`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`;



  constructor(private http: HttpClient) { 
      let now = new Date()
      this.month = now.getMonth() + 1;
      this.year = now.getFullYear();
      this.date = now.getDate() - 2;

      // added -2 here

      console.log({
        date : this.date,
        month : this.month,
        year : this.year
      });

      this.globalDataUrl = `${this.baseURL}${this.getDate(this.month)}-${this.getDate(this.date)}-${this.year}${this.extension}`;

      console.log(this.globalDataUrl);
      
      
  }


 // we will fetch the data from the github 
 getGlobalData() : Observable<GlobalDataSummary[]>
 {
   // response is not json it is csv file ie text so we will mention response type text here
   return this.http.get(this.globalDataUrl, {responseType: 'text'}).pipe(
     map(result=>{
       
       // create array to hold the data 
       let data: GlobalDataSummary[] = [];

       // now we are merging all the states of the country into country as a total value
       let raw = {}

       // we have to parse the text what we receive
       // here we will put each line in an array. we will spilt by next line
       // It will return the rows in an string array with all rows
       let rows = result.split('\n');
       // removing the zeroth index values of rows ie. removing first rowth from the data
       rows.splice(0, 1);
       //console.log(rows);
       
       // splitting into columns from each rows
       rows.forEach(rows=>{
         // regualr exp for splitting each rows into equal columns for eg. here 12 columns
         let cols=rows.split(/,(?=\S)/)
         

         let cs={
           // here we will fetch the data and store it in array
           country: cols[3],
           confirmed: +cols[7],
           deaths: + cols[8],
           recovered: +cols[9],
           active: +cols[10], 
         };
         // when there is the value of country name then we will merge the value of the country's cs
         // for that we will pass key cs.country
         let temp : GlobalDataSummary = raw[cs.country]
         // if there is an object in temp
         // ie. if there is an existing object in raw
         if(temp){
           // then we have to merge values
           // we are merging the new values from the existing object and the new object
           temp.active = cs.active + temp.active;
           temp.confirmed = cs.confirmed + temp.confirmed;
           temp.deaths = cs.deaths + temp.deaths;
           temp.recovered= cs.recovered + temp.recovered;

             // here key is the country name
         // here we are assigning whole object cs to raw's array of country name
         // when there is the value of country name then we will merge the value of the country's cs

         //now we will insert the temp object in raw
         raw[cs.country] = temp;
         }
         else{
           // if there is no object
           raw[cs.country] = cs;
         }
       
       })
       
       console.log(raw);
     
       // we are not interested in keys we want only values
       // This will return global data object array

       // for getting total number of cases in home component for that we have ot type cast object ot globaldatasummary
       // because Object.values is globaldatasummary array
       return <GlobalDataSummary[]>Object.values(raw); 
     }),
     catchError((error : HttpErrorResponse)=>{
      if(error.status == 404){
        this.date=this.date-1
        this.globalDataUrl = `${this.baseURL}${this.getDate(this.month)}-${this.getDate(this.date)}-${this.year}${this.extension}`;
        console.log(this.globalDataUrl);
        return this.getGlobalData();
      }
    })
   )
 }






  // we will create data to fetch data from dateWiseDataUrl
  getDateWiseData(){
    return this.http.get(this.dateWiseDataUrl, {responseType : 'text'})
    .pipe(map(result => {
      // we will split the result into new line to get the row
      // this will return all the rows
      let rows = result.split('\n');
      // console.log(rows)

      let mainData = {};

      // we have to remove the header from the rows
      // first we will hold the header
      let header = rows[0];
      // here we are splitting coulmns of rows 
      let dates = header.split(/,(?=\S)/)

      // now we want only date values from the headerValues and ignore Province/State,Country/Region,Lat,Long
      // so we will remove first 4 elements and fetch only date
      dates.splice(0, 4);
      // here we will reove the header
      rows.splice(0 , 1);
      // now we will iterate th rows
      rows.forEach(row=>{
        // first we will split the values with ',' to get the column values of the row
        let cols = row.split(/,(?=\S)/)
        // now we will store the country name
        let con = cols[1];
        // by this we get cases
        cols.splice(0, 4);
        // console.log(con, cols);
        
        mainData[con] = [];
        // now we will map these cases with the header which is dates
        // we will map these no. of cases with the dates and the country for that we will create global object ie main object mainData
        // first we iterate columns
        cols.forEach((value, index)=>{
          // now we will insert date, country, no. of cases to the array mainData
          let dw : DateWiseData ={
            // + is for parsing it to number
            cases: +value,
            country : con,
            date : new Date(Date.parse(dates[index]))
          }
          mainData[con].push(dw)
        })
      })

      // console.log(mainData);
      return mainData;
      

      return result;
    }))
  }

  // we will create an array which will have key value pair. the key will be country and value will
  // be interface which has country, case date. In this way we will insert the data in the array
  // for example
  // {India=[1,5,India]} in getDateWiseDate()
  // {country=[date, no. of cases, country]}



 
}
