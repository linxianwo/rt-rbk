import { randomBytes } from "crypto";
export enum FillType { // TODO:font size value
  TRIM = 0,
  X1,
  RACE,
  POOL,
  BANK,
  SELN,
  FORMULAR,
  VALUE,
}
export enum RuleType { // TODO:font size value
  NON = 0,
  RACE_EQ_FORMULAR_LEG,
  POOL_WP_QQP, // if pool=2,must be wp or qqp
  POOL_WP_QQP_CWA,
  WIN_PLA_WQ_NOBANK, // if pool = win or pla or wq ,then no bank,del bank pool
  WIN_PLA_WQ_NOBANK_CWA,
  ONLY_ONE_RACE_FORMULA, // FCT,TCE,QTT   Race=1 Formula=1
  ONLY_ONE_RACE_FORMULA_SELN, // FCT,TCE,QTT seln rule
  FF_TRI_DT_TT,
  POOL_EQ_LEG,
}
enum CCType { // TODO:font size value
  NON = 0,
  S,
  M, // if pool=2,must be wp or qqp
  B, // if pool = win or pla or wq ,then no bank,del bank pool
  BM, // FCT,TCE,QTT   Race=1 Formula=1
  MB, // FCT,TCE,QTT seln rule
}
enum TRIType { // TODO:font size value
  FF = 0,
  TRI,
  DT, // if pool=2,must be wp or qqp
  TT, // if pool = win or pla or wq ,then no bank,del bank pool
  NON
}
export class FillBetSlip {
  public str:String = "";
  public row = 0;
  public column = 0;
  public f_end:any;
  public f_begin = 0;

  public a_most = 0;
  public a_least = 0;

  public other:number[];
  public type = FillType.TRIM;
  public constructor(row=0,column=0,type=0,f_begin=0,f_end:any=0,a_least=0,a_most=0,other:number[]=[]){
    this.row=row;
    this.column=column;
    this.type=type;
    this.f_begin=f_begin;
    this.f_end=f_end;
  
    this.a_least=a_least;
    this.a_most=a_most;
    this.other=other;
  }
  
  public randomfillseln(length){
    let t=randomBytes(1);
    if(t[0]%length!==0){
      return this.randomfill(this.row,this.column,this.f_begin,this.f_end,this.a_least,this.f_end);            
    }else{
      this.randomfill();
      this.str = this.str.substr(0,this.str.length-1)+"1";
    }
  }
  public randomfill(row=this.row,column=this.column,f_begin:any=this.f_begin,f_end:any=this.f_end,atleast=this.a_least,atmost=this.a_most) {
    let res = "";
    let j = 0;
    let jobject = -1;
    for(let i=0;i<row*column;i++){
        let t=randomBytes(1);
        if(i>=f_begin){
          if((typeof f_end === 'number' && i<f_end)){
            if(j < atmost && (t[0]<(128*(atleast+atmost))/(f_end-f_begin) || f_end-i===atleast-j) ){
              res += '1';
              j++;
            }else{
              res += '0';
            }
          }else if(typeof f_end === 'object' && f_end.indexOf(i)>-1){
            if(j < atmost && (t[0]<(128*(atleast+atmost))/f_end.length || (f_end[f_end.length-1]===i&&atleast>j)) ){
            //  console.log("f_end.length-i="+(f_end.length-i));
              res += '1';
              j++;
              jobject=i;
            }else{
            //  console.log("f_end.length-i="+(f_end.length-i)+",atleast-j="+(atleast-j));
              res += '0';
            }
          } else {
              res += '0';
          }
        }else{
          res += '0';
        }
    }
    this.str += res;

    return jobject>=0?jobject:j; // f_end is object return index, f_end is arr return value=1's count
  }
}
export class FillBetSlipUtil {
  public xoffset = 0;
  public yoffset = 0;
  public xmax = 0;
  private ymax = 22;
  public result:Buffer;
  private xarroffset1 = [];
  private yarroffset1 = [];
  private xarroffset2 = [];
  private yarroffset2 = [];
  
  private yconst = 0;
  private slipId =0;
  public constructor(xmax,ymax=22){
    this.xmax=xmax;
    let res="";
    for(let x=0; x<xmax; x++){
      for(let y=0; y<ymax; y++){
        res+= '0';
      }
    }
    this.result = Buffer.from(res);
  }

  public pushlist(xa:number[],ya:number[]){
    let r="";
    for(let i=0;i<xa.length;i++){
      r="";
      for(let x=0; x<xa[i]; x++){
          for(let y=0; y<ya[i]; y++){
              r+= String.fromCharCode(48+i%10);
          }
      }
      this.push(Buffer.from(r),ya[i],xa[i]);
    }
  }
  public race_formula_bank_seln(xa:number[],ya:number[]){
    
  }

  public push(instr:Buffer, iny:number, inx:number){
    if(this.xoffset * this.yoffset >= this.xmax * this.ymax){
      return;
    } else if(this.xoffset + inx > this.xmax){
      return;
    } else if(this.yoffset + iny > this.ymax){
      return;
    }
    let i = 0;
    for(let x=this.xoffset; x<inx+this.xoffset; x++){
      for(let y=this.yoffset; y<iny+this.yoffset; y++){
        this.result[x*this.ymax+y] = instr[i++];
      }
    }
    this.xoffset+=inx;
    this.yoffset+=iny;
    if(this.xoffset===this.xmax && this.yoffset<this.ymax){// down
      this.yconst += iny;
      let sh = 0;
      let lasty = 0;
      let lastx = 0;
      let lastytmp = 0;
      while(lasty<iny){
        sh = this.yarroffset1.shift();
        sh = sh?sh:0;
        lasty += sh;
        if(sh === 0){
          break;
        }else{
          lastytmp = lasty-iny;
        }
        lastx = this.xarroffset1.shift();
      }
      lastx = lastx?lastx:0;
      if(lastytmp>0){
        this.yarroffset1.unshift(lastytmp);
        this.xarroffset1.unshift(lastx);
      }
      this.xoffset = this.xarroffset1[0]?this.xarroffset1[0]:0;
    } else if(this.yoffset===this.ymax && this.xoffset<this.xmax) { // right
      this.xarroffset2.push(this.xoffset);
      this.yarroffset2.push(iny);
      let sh = this.xarroffset2[0];
      this.xoffset = sh?sh:0;
      this.yoffset = this.yconst;
      this.xarroffset1 = this.xarroffset2;
      this.yarroffset1 = this.yarroffset2;
      this.xarroffset2 = [];
      this.yarroffset2 = [];
    } else if(this.yoffset<this.ymax && this.xoffset<this.xmax) { // down
      let lasty = 0;
      let lastx = 0;
      let lastytmp = 0;
      let sh = 0;
      while(lasty<iny){
        sh = this.yarroffset1.shift();
        sh = sh?sh:0;
        lasty += sh;
        if(sh === 0){
          break;
        }else{
          lastytmp = lasty-iny;
        }
        lastx = this.xarroffset1.shift();
      }
      lastx = lastx?lastx:0;
      if(lastytmp>0){
        this.yarroffset1.unshift(lastytmp);
        this.xarroffset1.unshift(lastx);
      }
      this.xoffset = this.xarroffset1[0]?this.xarroffset1[0]:0;
      this.xarroffset2.push(lastx+inx);
      this.yarroffset2.push(iny);
    } 
  }

  public createSlipdata(slipId,contentAndRule:FillBetSlip[],specRule){
    this.slipId=slipId;

    let r='';
    let race:FillBetSlip;
    let formular:FillBetSlip;
    let poolArr:FillBetSlip[]=[];
    let bankArr:FillBetSlip[]=[];
    let selnArr:FillBetSlip[]=[];
    for(let i=0;i<contentAndRule.length;i++){
      switch (contentAndRule[i].type) {
        case FillType.POOL:
        poolArr.push(contentAndRule[i]);
        break;
        case FillType.FORMULAR:
        formular=contentAndRule[i];
        break;
        case FillType.BANK:
        bankArr.push(contentAndRule[i]);
        break;
        case FillType.RACE:
        race=contentAndRule[i];
        break;
        case FillType.SELN:
        selnArr.push(contentAndRule[i]);
        break;
        case FillType.VALUE:
        contentAndRule[i] = this.fillValue(this.slipId,contentAndRule[i]);
        // contentAndRule[i].randomfill(contentAndRule[i].row,contentAndRule[i].column,0,
        //   contentAndRule[i].row * contentAndRule[i].column);
        // contentAndRule[i].str = contentAndRule[i].str.slice(0,6)+'0'+contentAndRule[i].str.slice(7,contentAndRule[i].str.length-1);
        break;
        default:
        contentAndRule[i].randomfill();
      }
    }
    let racenum = 0;
    let formulararr:number[];
    //order RuleType.RACE_EQ_FORMULAR_LEG > RuleType.POOL_WP_QQP > RuleType.WIN_PLA_WQ_NOBANK
    for(let i=0;i<specRule.length;i++){
      switch(specRule[i]){
        case RuleType.RACE_EQ_FORMULAR_LEG:
          racenum = race.randomfill();// race.row,race.column,0,15,4,6
          switch(slipId){
            case 181:
            case 186:
            formulararr = this.getformlar(racenum,2,4-0,2);
            break;
            case 185:
            formulararr = this.getformlar(racenum,9,4-0,4,2);
            break;
          }
          formular.randomfill(formular.row,formular.column,0,formulararr);
          break;
        case RuleType.POOL_WP_QQP:
        case RuleType.POOL_WP_QQP_CWA:
          for(let j=0;j<poolArr.length;j++){
            //let poolnum = poolArr[j].randomfill(poolArr[j].row,poolArr[j].column,0,4,2);
            if(j<racenum){
              poolArr[j].str=this.createValidate_pool(slipId,poolArr[j]);
            }else{
              poolArr[j].randomfill();
            }
          }
        break;
        case RuleType.WIN_PLA_WQ_NOBANK:
          for(let j=0;j<poolArr.length;j++){
            if(j<racenum){
              selnArr[j].randomfillseln(racenum+1);
              //selnArr[j].randomfill(selnArr[j].row,selnArr[j].column,selnArr[j].f_begin,selnArr[j].f_end,selnArr[j].a_least,selnArr[j].f_end);
              if(poolArr[j].str=='0001'||poolArr[j].str=='0010'||poolArr[j].str=='0011'){
                bankArr[j].randomfill(bankArr[j].row,bankArr[j].column,bankArr[j].f_begin,bankArr[j].f_end,bankArr[j].a_least,bankArr[j].f_end);
              }else{
                bankArr[j].randomfill();
              }
            }else{
              selnArr[j].randomfill();
              bankArr[j].randomfill();
            }
          }
        break;
        case RuleType.WIN_PLA_WQ_NOBANK_CWA:
          for(let j=0;j<poolArr.length;j++){
            if(j<racenum){
              if(poolArr[j].str=='1000000'){
                //selnArr[j*2+1].randomfill();
                //selnArr[j*2].randomfill(selnArr[j*2].row,selnArr[j*2].column,selnArr[j*2].f_begin,selnArr[j*2].f_end,selnArr[j*2].a_least,selnArr[j*2].a_least);
                selnArr[j].randomfill(1,selnArr[j].column,0,selnArr[j].f_begin,1,1);
                selnArr[j].randomfill(1,selnArr[j].column,0,0,0,0);
                selnArr[j].randomfill(selnArr[j].row-2,selnArr[j].column,0,0,0,0);
                bankArr[j].randomfill();
              }else if(poolArr[j].str=='0000010'||poolArr[j].str=='0000100'||poolArr[j].str=='0000110'){
                //selnArr[j*2+1].randomfillseln(racenum+1);
                //selnArr[j*2].randomfill();
                selnArr[j].randomfill(1,selnArr[j].column,0,0,0,0);
                selnArr[j].randomfill(1,selnArr[j].column,0,0,0,0);
                let tmp1= new FillBetSlip(selnArr[j].row-2,selnArr[j].column,0,0,selnArr[j].f_end,1,0);
                tmp1.randomfillseln(racenum+1);
                selnArr[j].str+=tmp1.str.toString();
                bankArr[j].randomfill(bankArr[j].row,bankArr[j].column,bankArr[j].f_begin,bankArr[j].f_end,bankArr[j].a_least,bankArr[j].f_end-1);
              }else{
                //selnArr[j*2+1].randomfillseln(racenum+1);
                //selnArr[j*2].randomfill();
                selnArr[j].randomfill(1,selnArr[j].column,0,0,0,0);
                selnArr[j].randomfill(1,selnArr[j].column,0,0,0,0);
                let tmp1= new FillBetSlip(selnArr[j].row-2,selnArr[j].column,0,0,selnArr[j].f_end,1,0);
                tmp1.randomfillseln(racenum+1);
                selnArr[j].str+=tmp1.str.toString();
                bankArr[j].randomfill();
              }
            }else{
              // selnArr[j*2+1].randomfill();
              // selnArr[j*2].randomfill();
              selnArr[j].randomfill();
              bankArr[j].randomfill();
            }
          }
        break;  
        case RuleType.ONLY_ONE_RACE_FORMULA:
          race.randomfill();// race.row,race.column,0,15,4,6
          racenum = formular.f_end.indexOf(formular.randomfill());
          break;  
        case RuleType.ONLY_ONE_RACE_FORMULA_SELN:
          let resarr = this.randomfillselnCC(bankArr,racenum+1);
          for(let i=0;i<resarr[0].length;i++){
            if(resarr[0][i][0]){
              bankArr[i].randomfillseln(bankArr.length+1);
            } else {
              bankArr[i].a_most = resarr[0][i][1];
              bankArr[i].randomfill();
            }
          }
          if(resarr[1][0][0]){
            selnArr[0].randomfillseln(selnArr.length+1);
          } else {
            selnArr[0].a_most = resarr[1][0][1];
            selnArr[0].randomfill();
          }
          break; 
        case RuleType.FF_TRI_DT_TT:
          let index = poolArr[0].randomfill();
          bankArr[0].randomfill();
          selnArr[0].randomfillseln(3);
          if(poolArr[0].f_end[index]===TRIType.TRI) {
            racenum = race.randomfill();  
            if(racenum === 1){//TRI
              formular.randomfill(formular.row,formular.column,0,0,0);
              bankArr[1].randomfill(bankArr[1].row,bankArr[1].column,0,0);
              selnArr[1].randomfill(selnArr[1].row,selnArr[1].column,0,0);
              bankArr[2].randomfill(bankArr[2].row,bankArr[2].column,0,0);
              selnArr[2].randomfill(selnArr[2].row,selnArr[2].column,0,0);
            }else{//ATRI
              formulararr = this.getformlar(racenum,2,4-0,2);
              formular.randomfill(formular.row,formular.column,0,formulararr,1);
              bankArr[1].randomfill();
              selnArr[1].randomfillseln(racenum+1);
              if(racenum === 2){
                bankArr[2].randomfill(bankArr[2].row,bankArr[2].column,0,0);
                selnArr[2].randomfill(selnArr[2].row,selnArr[2].column,0,0);
              } else if(racenum === 3){
                bankArr[2].randomfill();
                selnArr[2].randomfillseln(racenum+1);
              }
            }
          }else{
            formular.randomfill(formular.row,formular.column,0,0,0);
            if(poolArr[0].f_end[index]===TRIType.FF){
              race.randomfill(race.row,race.column,race.f_begin,race.f_end,1,1);
              bankArr[1].randomfill(bankArr[1].row,bankArr[1].column,0,0);
              selnArr[1].randomfill(selnArr[1].row,selnArr[1].column,0,0);
              bankArr[2].randomfill(bankArr[2].row,bankArr[2].column,0,0);
              selnArr[2].randomfill(selnArr[2].row,selnArr[2].column,0,0);
            }else {
              race.randomfill(race.row,race.column,race.f_begin,race.f_end,0,1);
              bankArr[1].randomfill();
              selnArr[1].randomfillseln(3+1);
              if(poolArr[0].f_end[index]===TRIType.DT){
                bankArr[2].randomfill(bankArr[2].row,bankArr[2].column,0,0);
                selnArr[2].randomfill(selnArr[2].row,selnArr[2].column,0,0);
              }else{
                bankArr[2].randomfill();
                selnArr[2].randomfillseln(3+1);
              }
            }
            
          }
          //racenum = formular.f_end.indexOf(formular.randomfill());

          //formulararr = this.getformlar(racenum,2,4-0,2);
          break;
        case RuleType.POOL_EQ_LEG:
          race.randomfill();// race.row,race.column,0,15,4,6
          let DBL_TBL_6UP_Array = [2,3,6];
          racenum = poolArr[0].randomfill();
          for(let i = 0;i < selnArr.length;i++){
            let itmp = (i%2===0)?Math.floor(i/2):(3+Math.floor(i/2));
            if(itmp < DBL_TBL_6UP_Array[racenum]){
              selnArr[i].randomfillseln(racenum+1);
            } else {
              selnArr[i].randomfill();
            }
          }
          break; 
      }
    }
    for(let i=0;i<contentAndRule.length;i++){
      this.push(Buffer.from(contentAndRule[i].str),contentAndRule[i].column,contentAndRule[i].row);

      // r="";
      // for(let x=0; x<contentAndRule[i][0]; x++){
      //     for(let y=0; y<contentAndRule[i][1]; y++){
      //         r+= String.fromCharCode(48+i%10);
      //     }
      // }
      //this.push(Buffer.from(r),ya[i],xa[i]);
    }

    

    // let leg1st = new FillBetSlip();//1ST LEG
    // leg1st.randomfill(1,4);
    // this.push(Buffer.from(leg1st.str),1,4);
    
    // // let leg1st_pool_box = new FillBetSlip();//pool_box
    // // let poolbox1 = leg1st_pool_box.randomfill(1,4,4,1);
    // // this.push(Buffer.from(leg1st_pool_box.str),1,4);
    // this.push(Buffer.from("1000"),1,4);

    // let leg1st_bank_box = new FillBetSlip();//bank1
    // leg1st_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg1st_bank_box.str),3,4);

    // let leg1st_seln_box = new FillBetSlip();//value1
    // leg1st_seln_box.randomfill(10,4,34,1); //
    // this.push(Buffer.from(leg1st_seln_box.str),10,4);


    // let leg2nd = new FillBetSlip();//2nd LEG
    // leg2nd.randomfill(2,4);
    // this.push(Buffer.from(leg2nd.str),2,4);

    // let leg2ndt_pool_box = new FillBetSlip();//pool_box
    // leg2ndt_pool_box.randomfill(1,4,4,1);
    // this.push(Buffer.from(leg2ndt_pool_box.str),1,4);
    
    // let leg2nd_bank_box = new FillBetSlip();//bank2
    // leg2nd_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg2nd_bank_box.str),3,4);

    // let leg2nd_seln_box = new FillBetSlip();//value2
    // leg2nd_seln_box.randomfill(10,4,34,1);
    // this.push(Buffer.from(leg2nd_seln_box.str),10,4);

    // let leg3rd = new FillBetSlip();//3RD LEG
    // leg3rd.randomfill(1,16,15,6);
    // this.push(Buffer.from(leg3rd.str),1,16);

    // let leg3rd_trim = new FillBetSlip();//3RD LEG
    // leg3rd_trim.randomfill(1,4);
    // this.push(Buffer.from(leg3rd_trim.str),1,4);

    // let leg3rd_pool_box = new FillBetSlip();//pool_box
    // leg3rd_pool_box.randomfill(1,4,4,1);
    // this.push(Buffer.from(leg3rd_pool_box.str),1,4);
    
    // let leg3rd_bank_box = new FillBetSlip();//bank3
    // leg3rd_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg3rd_bank_box.str),3,4);

    // let leg3rd_seln_box = new FillBetSlip();//value3
    // leg3rd_seln_box.randomfill(10,4,34,1);
    // this.push(Buffer.from(leg3rd_seln_box.str),10,4);

    
    // let leg4th = new FillBetSlip();//4TH LEG
    // leg4th.randomfill(1,4);
    // this.push(Buffer.from(leg4th.str),1,4);

    // let leg4th_trim = new FillBetSlip();//4TH LEG
    // leg4th_trim.randomfill(1,4);
    // this.push(Buffer.from(leg4th_trim.str),1,4);

    // let leg4th_pool_box = new FillBetSlip();//pool_box
    // leg4th_pool_box.randomfill(1,4,4,1);
    // this.push(Buffer.from(leg4th_pool_box.str),1,4);
    
    // let leg4th_bank_box = new FillBetSlip();//bank4
    // leg4th_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg4th_bank_box.str),3,4);

    // let leg4th_seln_box = new FillBetSlip();//value4
    // leg4th_seln_box.randomfill(10,4,34,1);
    // this.push(Buffer.from(leg4th_seln_box.str),10,4);

    // let leg5th_trim = new FillBetSlip();//5TH LEG
    // leg5th_trim.randomfill(1,4);
    // this.push(Buffer.from(leg5th_trim.str),1,4);

    // let leg5th_pool_box = new FillBetSlip();//pool_box
    // leg5th_pool_box.randomfill(1,4,4,1);
    // this.push(Buffer.from(leg5th_pool_box.str),1,4);
    
    // let leg5th_bank_box = new FillBetSlip();//bank5
    // leg5th_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg5th_bank_box.str),3,4);

    // let leg5th_seln_box = new FillBetSlip();//value4
    // leg5th_seln_box.randomfill(10,4,34,1);
    // this.push(Buffer.from(leg5th_seln_box.str),10,4);

    // let leg6th_trim = new FillBetSlip();//6TH LEG
    // leg6th_trim.randomfill(1,4);
    // this.push(Buffer.from(leg6th_trim.str),1,4);

    // let leg6th_pool_box = new FillBetSlip();//pool_box
    // leg6th_pool_box.randomfill(1,4,4,1);
    // this.push(Buffer.from(leg6th_pool_box.str),1,4);
    
    // let leg6th_bank_box = new FillBetSlip();//bank6
    // leg6th_bank_box.randomfill(3,4,12,1);
    // this.push(Buffer.from(leg6th_bank_box.str),3,4);

    // let leg6th_seln_box = new FillBetSlip();//value6
    // leg6th_seln_box.randomfill(10,4,34,1);
    // this.push(Buffer.from(leg6th_seln_box.str),10,4);

    // let formula_box = new FillBetSlip();//formula_box
    // formula_box.randomfill(8,4);
    // this.push(Buffer.from(formula_box.str),8,4);
    // this.push(Buffer.from("1000"),1,4);

    // this.push(Buffer.from("1000"),1,4);
    // let value_box = new FillBetSlip();//value_box
    // value_box.randomfill(5,4,20,1);
    // this.push(Buffer.from(value_box.str),5,4);
  }
 
  private getformlar1(racenum, slipid):number[]{
    let slip;
    switch (slipid){
      case 185:
      let formular=[[1,2,10,11,18,19,27,28],
                    [3,4,5,12,13,20,21,22,29,30,31],
                    [6,7,8,14,15,16,17,23,24,25,26,32,33,34,35]];
      slip = formular[racenum-4];
      break;
    }
    

    return slip;
  }
 
  private getformlar(racenum1,row,column,begin_formula=0,offset_begin_x_cell=0):number[]{
    // offset_begin_x_cell <= column   column=y-offset_end_y_line
    if(racenum1<2||racenum1>8) return [];
    let racenum = racenum1 - 2;
    let num1 = racenum<4?1<racenum?racenum-1:0:0;
    let num2 = racenum===4?racenum:0;
    let num3 = racenum>4?racenum>5?-7:-6:0;
    let num = (racenum?3:2)+2*racenum+(num1?num1:num2?num2:num3);
    let slip = [];
    let forarr = [0,0,2,5,8,11,15,7,8];
    let x_offset = offset_begin_x_cell;
    for(let i=begin_formula;i<forarr.length && i<racenum1;i++){
      x_offset+=forarr[i];
    }
    let firstindex=Math.floor(x_offset/column)+(x_offset%column)*row;
    for(let i = 0;i < num;i++){
      slip.push(firstindex);
      firstindex += row;
      if(firstindex>=row*column){
        firstindex = firstindex%row+1;
      }
    }
    
    return slip;
  }

  private createValidate_pool(slipId,pool){
    let index;
    switch (slipId){
      case 181:
      case 185:
        pool.randomfill(1,pool.f_end,0,pool.f_end,1,2);
        while(pool.str == '1010' ||pool.str == '1001' || pool.str == '0110' || pool.str == '0101'){
          pool.str = '';
          pool.randomfill(1,pool.f_end,0,pool.f_end,1,2);
          //pool.randomfill(pool.row,pool.column,0,pool.row*pool.column,1,2);
        }
        for(let i=0;i<pool.row-pool.f_end;i++){
          pool.str += '0';
        }
        break;
      case 186:
        index = pool.randomfill(1,pool.row,0,pool.f_end,pool.a_least,pool.a_least);
        if(index>1&&index<6){
          let t=randomBytes(1);
          if(t[0]%2!==0){
            if(index>3){
              pool.str = "0000110";
            }else{
              pool.str = "0011000";
            }
          } 
        }
        break;
    }
    return pool.str;
  }

  private fillValue(slipId,content){
    let t=randomBytes(1);
    switch (slipId){
      case 185:
      case 181:
      case 182:
      case 186:
        if(t[0]%2===0){
          content.str='1';
          content.randomfill(1,5,0,5,0,5);
          content.str+='0';
        }else{
          content.str='0';
          content.randomfill(1,5,0,5,0,5);
          content.str+='1';
        }
        content.randomfill(1,5,0,5,0,5);
        content.randomfill(2,6,0,10,0,10);
        break;
      case 183:
        if(t[0]%2===0){
          content.str='1';
          content.randomfill(1,6,0,6,0,6);
          content.str+='0';
        }else{
          content.str='0';
          content.randomfill(1,6,0,6,0,6);
          content.str+='1';
        }
        content.randomfill(1,6,0,5,0,5);
        content.randomfill(1,7,0,6,0,6);
        content.randomfill(1,7,0,6,0,6);
        break;
      default:
        content.randomfill();
        break;
    }
    return content;
  }
  private randomfillselnCC(bankArr,CCID){//seln must 1,so do not pass to here
    let res=[[],[]];
    switch (CCID){
      case CCType.S:
        for(let i=0;i<bankArr.length;i++){
          res[0].push([false,1]);//use f ,at_most
        }
        res[1].push([false,0]);//use f ,at_most
      break;
      case CCType.M:
        for(let i=0;i<bankArr.length;i++){
          res[0].push([false,0]);//use f ,at_most
        }
        res[1].push([true,1]);
      break;
      case CCType.B:
      case CCType.BM:
        for(let i=0;i<bankArr.length-1;i++){
          res[0].push([false,1]);//use f ,at_most
        }
        res[0].push([false,0]);// last bank no one
        res[1].push([true,1]);
      break;
      case CCType.MB:
        for(let i=0;i<bankArr.length;i++){
          res[0].push([true,1]);//use f ,at_most
        }
        res[1].push([false,0]);
      break;
    }
    return res;
  }
  public static creatslipdata(slipid,training=false){
    let a; 
    let contentAndRule;
    let specRule;
    switch (slipid){
      case 184:
      a = new FillBetSlipUtil(19);
      contentAndRule=[new FillBetSlip(19,8,FillType.TRIM),
        new FillBetSlip(19,1,FillType.X1,17,19,1,1),
        new FillBetSlip(8,2,FillType.FORMULAR,0,[0,6,12,1,7],1,1),// 7.unuse
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.BANK,0,34,1,0),
        new FillBetSlip(11,2,FillType.RACE,0,[5,7,9,10,11,12,13,14,15,16,17,18,19,20,21],1,1),
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.BANK,0,34,1,0),
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.BANK,0,34,1,0),
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.SELN,0,34,1,0),
        new FillBetSlip(3,1,FillType.TRIM,0,2,1,1),
        new FillBetSlip(3,8,FillType.VALUE,0,23,1,23),
        new FillBetSlip(3,2,FillType.TRIM),
        ];
      specRule=[RuleType.ONLY_ONE_RACE_FORMULA,RuleType.ONLY_ONE_RACE_FORMULA_SELN]; // if pool == 2 rule=1100 or 0011
      
      break;
      case 187:
      a = new FillBetSlipUtil(15);
      contentAndRule=[new FillBetSlip(15,8,FillType.TRIM),
        new FillBetSlip(7,1,FillType.TRIM),
        new FillBetSlip(7,2,FillType.FORMULAR,0,[0,6,12,1,7],1,1),// 7.unuse
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.BANK,0,34,1,0),
        new FillBetSlip(2,1,FillType.X1,0,2,1,1),
        new FillBetSlip(2,2,FillType.TRIM),
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.BANK,0,34,1,0),
        new FillBetSlip(6,3,FillType.RACE,0,[1,2,4,5,6,7,8,9,10,11,12,13,14,15,16],1,1),
        new FillBetSlip(4,1,FillType.TRIM),
        new FillBetSlip(4,10,FillType.SELN,0,34,1,0),
        new FillBetSlip(3,1,FillType.TRIM,0,2,1,1),
        new FillBetSlip(3,8,FillType.VALUE,0,23,1,23),
        new FillBetSlip(3,2,FillType.TRIM),
        ];
      specRule=[RuleType.ONLY_ONE_RACE_FORMULA,RuleType.ONLY_ONE_RACE_FORMULA_SELN]; // if pool == 2 rule=1100 or 0011
      
      break;
      case 185:
        a = new FillBetSlipUtil(28);
        contentAndRule=[
            new FillBetSlip(28,6,FillType.TRIM),
                new FillBetSlip(4,1,FillType.X1,0,2,1,1),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),//7.WP or QQP ,[2,['1100','0011']]
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),
                new FillBetSlip(4,2,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),
                new FillBetSlip(16,1,FillType.RACE,0,15,4,6),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,1,FillType.POOL,0,4,0,0),
                new FillBetSlip(4,3,FillType.BANK,0,12,0,0),
                new FillBetSlip(4,10,FillType.SELN,0,34,1,0,[39]),//7. full
                new FillBetSlip(4,9,FillType.FORMULAR,0,36,1,1,[0,9]),// 7.unuse
                new FillBetSlip(4,6,FillType.VALUE,0,24,1,1,[0,6]),// 7.value type
                ];
        specRule=[RuleType.RACE_EQ_FORMULAR_LEG,RuleType.POOL_WP_QQP,RuleType.WIN_PLA_WQ_NOBANK]; // if pool == 2 rule=1100 or 0011
      break;
      case 180:
        a = new FillBetSlipUtil(12);
        contentAndRule=[
            new FillBetSlip(12,12,FillType.TRIM),
            new FillBetSlip(6,1,FillType.TRIM,0,2,1,1),
            new FillBetSlip(6,4,FillType.VALUE,0,23,1,23),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.BANK,0,14,1,0),
            new FillBetSlip(3,5,FillType.FORMULAR,0,[0,1,2,3,4],1,1),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.BANK,0,14,1,0),
            new FillBetSlip(3,5,FillType.RACE,0,15,1,1),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.SELN,0,14,1,0),
                ];
            specRule=[RuleType.ONLY_ONE_RACE_FORMULA,RuleType.ONLY_ONE_RACE_FORMULA_SELN]; // if pool == 2 rule=1100 or 0011
        break;
        case 181:
        a = new FillBetSlipUtil(19);
        contentAndRule=[
            new FillBetSlip(19,7,FillType.TRIM),
            new FillBetSlip(5,1,FillType.POOL,0,4,0,0),//7.WP or QQP ,[2,['1100','0011']]
            new FillBetSlip(5,7,FillType.BANK,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.POOL,0,4,0,0),//7.WP or QQP ,[2,['1100','0011']]
            new FillBetSlip(5,7,FillType.BANK,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.POOL,0,4,0,0),//7.WP or QQP ,[2,['1100','0011']]
            new FillBetSlip(5,7,FillType.BANK,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(4,1,FillType.X1,2,4,1,1),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.RACE,0,15,2,3),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,2,FillType.FORMULAR,0,7,1,1),// 7.unuse
            new FillBetSlip(4,6,FillType.VALUE,0,24,1,1,[0,6]),
                ];
        specRule=[RuleType.RACE_EQ_FORMULAR_LEG,RuleType.POOL_WP_QQP,RuleType.WIN_PLA_WQ_NOBANK]; // if pool == 2 rule=1100 or 0011
      break;
      case 182:
        a = new FillBetSlipUtil(19);
        contentAndRule=[
            new FillBetSlip(19,7,FillType.TRIM),
            new FillBetSlip(5,1,FillType.TRIM),
            new FillBetSlip(5,7,FillType.BANK,0,34,1,34),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.POOL,0,[0,1,2,3],1,1),//FF TRI DT TT
            new FillBetSlip(5,7,FillType.BANK,0,34,1,34),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.TRIM),
            new FillBetSlip(5,7,FillType.BANK,0,34,1,34),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(4,1,FillType.X1,2,4,1,1),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.RACE,0,15,1,3),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,2,FillType.FORMULAR,0,7,0,1),// 7.unuse
            new FillBetSlip(4,6,FillType.VALUE,0,24,1,1,[0,6]),
                ];
        specRule=[RuleType.FF_TRI_DT_TT]; // if pool == 2 rule=1100 or 0011
      break;
      case 183:
        a = new FillBetSlipUtil(19);
        contentAndRule=[
            new FillBetSlip(19,7,FillType.TRIM),
            new FillBetSlip(5,1,FillType.POOL,0,[0,1,2],1,1),//FF TRI DT TT
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.TRIM),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,1,FillType.TRIM),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(5,7,FillType.SELN,0,34,1,0),
            new FillBetSlip(4,1,FillType.X1,2,4,1,1),
            new FillBetSlip(4,1,FillType.TRIM),
            new FillBetSlip(4,4,FillType.RACE,0,15,1,1),
            new FillBetSlip(4,2,FillType.TRIM),
           // new FillBetSlip(4,2,FillType.FORMULAR,0,7,0,1),// 7.unuse
            new FillBetSlip(4,7,FillType.VALUE,0,25,1,1,[0,7]),
                ];
        specRule=[RuleType.POOL_EQ_LEG]; // if pool == 2 rule=1100 or 0011
      break;
      case 186:
        a = new FillBetSlipUtil(25);
        contentAndRule=[
            new FillBetSlip(25,7,FillType.TRIM),
                new FillBetSlip(25,1,FillType.X1,23,25,1,1),
                new FillBetSlip(25,1,FillType.TRIM),
                new FillBetSlip(7,1,FillType.POOL,0,[0,2,3,4,5],1,0),//7.WP or QQP ,[2,['1100','0011']]
                new FillBetSlip(7,5,FillType.BANK,0,34,0,0),
                new FillBetSlip(7,7,FillType.SELN,4,34,1,0),
                // new FillBetSlip(1,7,FillType.SELN,0,4,1,0),
                new FillBetSlip(7,1,FillType.POOL,0,[0,2,3,4,5],1,0),//7.WP or QQP ,[2,['1100','0011']]
                new FillBetSlip(7,5,FillType.BANK,0,34,0,0),
                new FillBetSlip(7,7,FillType.SELN,4,34,1,0),
                // new FillBetSlip(1,7,FillType.TRIM),
                new FillBetSlip(7,1,FillType.POOL,0,[0,2,3,4,5],1,0),//7.WP or QQP ,[2,['1100','0011']]
                new FillBetSlip(7,5,FillType.BANK,0,34,0,0),
                new FillBetSlip(7,7,FillType.SELN,4,34,1,0),
                // new FillBetSlip(5,7,FillType.SELN,0,34,1,0,[34]),
                new FillBetSlip(4,4,FillType.RACE,0,15,1,3),
                new FillBetSlip(4,1,FillType.TRIM),
                new FillBetSlip(4,2,FillType.FORMULAR,0,7,1,1),// 7.unuse
                // new FillBetSlip(1,7,FillType.SELN,0,4,1,0),
                // new FillBetSlip(1,7,FillType.TRIM),
                // new FillBetSlip(5,7,FillType.SELN,0,34,1,0,[34]),
                // new FillBetSlip(1,7,FillType.SELN,0,4,1,0),
                // new FillBetSlip(1,7,FillType.TRIM),
                // new FillBetSlip(5,7,FillType.SELN,0,34,1,0,[34]),
                new FillBetSlip(4,6,FillType.VALUE,0,24,1,1,[0,6]),// 7.value type
                ];
        specRule=[RuleType.RACE_EQ_FORMULAR_LEG,RuleType.POOL_WP_QQP_CWA,RuleType.WIN_PLA_WQ_NOBANK_CWA]; // if pool == 2 rule=1100 or 0011
      break;
    }
    if(training){
      let xarr=[];
      let yarr=[];
      let resarr=[xarr,yarr];
      for(let ii=0;ii<contentAndRule.length;ii++){
        xarr.push(contentAndRule[ii].row);
        yarr.push(contentAndRule[ii].column);
      }
      return resarr;
    }else{
      a.createSlipdata(slipid,contentAndRule,specRule);
      return a;
    }
  }
}
