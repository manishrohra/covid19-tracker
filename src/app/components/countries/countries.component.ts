import { Component, OnInit } from '@angular/core';
import { DataServiceService } from 'src/app/services/data-service.service';
import { GlobalDataSummary } from 'src/app/models/global-data';
import { DateWiseData } from 'src/app/models/date-wise-date';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',

  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {

  country1 : string
  data : GlobalDataSummary[];
  countries : string[] = [];
  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  selectedCountryData : DateWiseData[];
  dateWiseData;
  loading = true;
  datatable=[]

  chart = {
    LineChart : "LineChart" ,
    myTitle : "Datewise Cases",
    height : 400,
    width : 700,
    options: {
      animation:{
        duration: 1000,
        easing: 'out'
      },
      is3D: true
    }
  }

    



  constructor(private service : DataServiceService) { }

  ngOnInit(): void {
    
    // setting default values for the country on the countries tab
    // we will merge these below two subscriptions here
    merge(
      this.service.getDateWiseData().pipe(
        map(result=>{
          this.dateWiseData = result;
        })
      ),
      this.service.getGlobalData().pipe(
        map(result=>{
        this.data = result;
        console.log(result)
        this.data.forEach(cs=>{
        this.countries.push(cs.country)
      })
      })
      )
    ).subscribe(
      {
        complete : ()=>{
          this.updateValue('India');
          console.log("before update chart")
        }
      }
    )

  }

  updateChart(){
    
    this.datatable=[]
    // adding header in the first row
   // this.datatable.push(['Date', 'Cases'])
    // now iterating on data
    this.selectedCountryData.forEach(cs=>{
      this.datatable.push([cs.date, cs.cases])
      
    })
    console.log(this.datatable)

    
  }





  updateValue(country : string)
  {
    this.country1 = country
    this.data.forEach(cs=>{
      if(cs.country == country)
      {
        this.totalActive = cs.active;
        this.totalDeaths = cs.deaths;
        this.totalRecovered = cs.recovered;
        this.totalConfirmed = cs.confirmed;
      }
    })

    // we have to should country's data in table when when we select specific country
    // when we select a country we will pass this data to mainData
    // this.dateWiseData[country] will return array of countries
    this.selectedCountryData = this.dateWiseData[country]
    // console.log(this.selectedCountryData);
    console.log("calling update chart")
    // when we select the country we have to update chart
    this.updateChart();
    
    console.log("After update chart")
  }
}