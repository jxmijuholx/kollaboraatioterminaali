package pong.kollaboraatioterminaali.demoasci;

public class GameTable {

     //Alustava pelitaulun piirtäminen
     public static final String column_char = "#";
     public static final int columns = 10;
     public static final int rows = 40;
 
     public void drawTable(){
 
         System.out.println();
         for (int cd = 0; cd < columns; cd++) {
             for (int rd = 0; rd < rows; rd++) {
                 if (rd == 0 || cd == columns - 1 || rd == 0 || rd == rows - 1) {
                     System.out.print(column_char); 
                 } else {
                     System.out.print(" ");
                 }
             }
             System.out.println();
         }
     }
 

}
