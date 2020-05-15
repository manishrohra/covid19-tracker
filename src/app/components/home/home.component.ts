import { Component, OnInit } from '@angular/core';
import { DataServiceService } from 'src/app/services/data-service.service';
import { GlobalDataSummary } from 'src/app/models/global-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  totalConfirmed = 0;
  totalActive = 0;
  totalDeaths = 0;
  totalRecovered = 0;
  loading = true
  globalData : GlobalDataSummary[];
  datatable = [];
  
  chart = {
    PieChart : "PieChart" ,
    ColumnChart : "ColumnChart" , 
    LineChart : "LineChart",
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




  constructor(private dataService: DataServiceService) { }


  // here we will get the Html input element from the updateChart() from html
  updateChart(input : HTMLInputElement){
    console.log(input.value);
    
    // according to the value recieved from html we will update the charts
    // now we will update the chart according to the value recieved
    this.initChart(input.value);


    // here we are calling initChart() but we are not clearing the data of the chart
    // below datatable is used fro clearing the chart
  } 


  // here we will pass the caseType and based on that we will retrieve the values
  // ie. for c from confirmed and r for recovered
  initChart(caseType : string){

    // we will create datatabe for clearing the chart and again it will iterate datatable and again it will empty the datatable
    this.datatable = []

    // This datatable is for title
    // this.datatable.push(["Country" , "Cases"])
    // now we will fill this datatable with our original data
    this.globalData.forEach(cs=>{

    // here based on caseType we will retrieve the values
    let value : number;
    if(caseType=='c')
    // if caseType=='c' then push cs.confirmed
    // Here we will show only coutries whose cases>50000
      if(cs.confirmed > 50000)
        value=cs.confirmed
      
      if(caseType=='a')
      // if caseType=='c' then push cs.confirmed
      // Here we will show only coutries whose cases>50000
        if(cs.active > 50000)
          value=cs.active


        if(caseType=='d')
        // if caseType=='c' then push cs.confirmed
        // Here we will show only coutries whose cases>50000
          if(cs.deaths > 1000)
            value=cs.deaths
          

          if(caseType=='r')
          // if caseType=='c' then push cs.confirmed
          // Here we will show only coutries whose cases>50000
            if(cs.recovered > 10000)
              value=cs.recovered
        
            
                this.datatable.push([
                  // here we will push the value in the datatable
                  cs.country , value
                ])
    })
    console.log(this.datatable);

   
     

  

  }


  ngOnInit(): void {

    // will get data from the github repository and will print
    this.dataService.getGlobalData()
    .subscribe({
      next: (result)=>{
        console.log(result);
        this.globalData = result;
        // we will iterate on the result and calculate total number of cases
        // cs is a case
        result.forEach(cs=>{
          // because last row is undefined
          if(!Number.isNaN(cs.confirmed)){
          this.totalActive+=cs.active
          this.totalConfirmed+=cs.confirmed
          this.totalDeaths+=cs.deaths
          this.totalRecovered+=cs.recovered
          }
        })

        // here we will call the initChart()
        // here we will pass the initial value ie. 'c' on initChart()
        this.initChart('c');
      },
      complete : ()=>{
        this.loading = false;
      }
    })
  }


}
