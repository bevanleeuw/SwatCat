import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { config } from "./config";
import { dbFundingRateRecord } from "./types";

// Funding Rates
export async function createTableFunding(database: any): Promise<boolean> {
  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS fundingRate (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        fundingRate REAL NOT NULL,
        fundingRatePerc REAL NOT NULL,
        indexPrice REAL NOT NULL,
        markPrice REAL NOT NULL,
        estimatedPrice REAL NOT NULL,
        payer TEXT NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    return false;
  }
}
export async function insertFunding(funding: dbFundingRateRecord) {
  const db = await open({
    filename: config.settings.db_name_tracker,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const fundingTableExist = await createTableFunding(db);
  if (!fundingTableExist) {
    await db.close();
  }

  // Proceed with adding funding record
  if (fundingTableExist) {
    const { time, symbol, fundingRate, fundingRatePerc, indexPrice, markPrice, estimatedPrice, payer } = funding;
    await db.run(
      `
    INSERT INTO fundingRate (time, symbol, fundingRate, fundingRatePerc, indexPrice, markPrice, estimatedPrice, payer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `,
      [time, symbol, fundingRate, fundingRatePerc, indexPrice, markPrice, estimatedPrice, payer]
    );

    await db.close();
  }
}
export async function selectAllFundingRates() {
  const db = await open({
    filename: config.settings.db_name_tracker,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const fundingTableExist = await createTableFunding(db);
  if (!fundingTableExist) {
    await db.close();
  }

  // Proceed with adding funding record
  if (fundingTableExist) {
    const fr = await db.all("SELECT * FROM fundingRate");
    await db.close();
    console.log(fr);
  }
}
