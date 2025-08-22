// Property Basic Profile types based on Attom API documentation
export interface PropertyBasicProfileData {
  identifier?: {
    id: string;
    fips?: string;
    apn?: string;
  };
  address?: {
    country: string;
    countrySubd: string;
    line1: string;
    line2?: string;
    locality: string;
    matchCode?: string;
    oneLine: string;
    postal1: string;
    postal2?: string;
    postal3?: string;
  };
  location?: {
    accuracy: string;
    elevation?: number;
    latitude: string;
    longitude: string;
    distance?: number;
  };
  summary?: {
    absenteeInd?: string;
    propclass: string;
    propsubtype?: string;
    proptype: string;
    yearbuilt?: number;
    propLandUse?: string;
    propIndicator?: string;
    legal1?: string;
  };
  lot?: {
    lotNum?: string;
    lotsize1?: number;
    lotsize2?: number;
    pooltype?: string;
    situsCounty: string;
    subdname?: string;
    subdtractnum?: string;
  };
  area?: {
    absenteeInd?: string;
    areaLot?: number;
    areaSqFt?: number;
    bathrooms?: number;
    bathroomsFull?: number;
    bathroomsPartial?: number;
    bedrooms?: number;
    roomsTotal?: number;
  };
  building?: {
    construction?: {
      condition?: string;
      constructionType?: string;
      exteriorWalls?: string;
      foundationMaterial?: string;
      quality?: string;
      roofCover?: string;
      roofFrame?: string;
      style?: string;
    };
    interior?: {
      fplctype?: string;
      fuel?: string;
      heating?: string;
    };
    parking?: {
      garagetype?: string;
      prkgSize?: number;
      prkgType?: string;
    };
    size?: {
      grossSizeAdjusted?: number;
      grossSizeGeneral?: number;
      livingSize?: number;
      sizeInd?: string;
      universalSize?: number;
    };
    summary?: {
      archStyle?: string;
      levels?: number;
      noOfBaths?: number;
      noOfPartialBaths?: number;
      noOfBeds?: number;
      noOfRooms?: number;
      proptype?: string;
      story?: number;
      unitsCount?: number;
      yearBuilt?: number;
      yearBuiltEffective?: number;
    };
  };
  assessment?: {
    appraised?: {
      apprisedTtl?: number;
      apprisedVal?: number;
      assdTtl?: number;
      assdVal?: number;
      mktTtl?: number;
      mktVal?: number;
      taxYear?: number;
    };
    assessor?: {
      apn?: string;
      assdValue?: number;
      mktValue?: number;
      taxYear?: number;
    };
    market?: {
      apprCurr?: number;
      apprPrev?: number;
      apprYear?: number;
      taxYear?: number;
    };
    tax?: {
      exemptflag?: string;
      exemptions?: Array<{
        exemptType: string;
        exemptAmt: number;
      }>;
      taxAmt?: number;
      taxPerSizeUnit?: number;
      taxRate?: number;
      taxYear?: number;
    };
  };
  sale?: {
    amount?: {
      saleAmt?: number;
      saleAmtCurr?: number;
    };
    calculation?: {
      pricePerSizeUnit?: number;
      saleAmtCurr?: number;
    };
    salesHistory?: Array<{
      amount: {
        saleAmt: number;
        saleAmtRounded: number;
      };
      calculation?: {
        pricePerSizeUnit?: number;
      };
      salesSearchDate: string;
      saleTransDate: string;
    }>;
    transaction?: {
      contractDate?: string;
      saleRecDate?: string;
      saleSearchDate?: string;
      saleTransDate?: string;
    };
  };
  owner?: {
    corporateIndicator?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    owner1Full?: string;
    owner2Full?: string;
    owner3Full?: string;
    owner4Full?: string;
    mailingAddress?: {
      country?: string;
      countrySubd?: string;
      line1?: string;
      line2?: string;
      locality?: string;
      oneLine?: string;
      postal1?: string;
      postal2?: string;
    };
  };
  vintage?: {
    lastModified: string;
    pubDate: string;
  };
}

export interface PropertyBasicProfileResponse {
  status: {
    version: string;
    code: number;
    msg: string;
    total: number;
    page: number;
    pagesize: number;
  };
  property?: PropertyBasicProfileData[];
}