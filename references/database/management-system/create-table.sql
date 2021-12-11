-- ----------------------------
-- Table structure for Ward
-- ----------------------------
DROP TABLE IF EXISTS "public"."Ward";
CREATE TABLE "public"."Ward" (
  "id" int4 NOT NULL,
  "name" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "prefix" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "districtId" int4
)
;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS "public"."User";
CREATE TABLE "public"."User" (
  "userId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "uuid" uuid NOT NULL,
  "fullname" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "peopleId" varchar(12) COLLATE "pg_catalog"."default" NOT NULL,
  "DOB" timestamptz(6) DEFAULT '1970-01-01 07:00:00+07'::timestamp with time zone,
  "statusF" int2 NOT NULL DEFAULT 0,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "managerId" int4,
  "accountId" int4 NOT NULL,
  "addressId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for TreatmentHistory
-- ----------------------------
DROP TABLE IF EXISTS "public"."TreatmentHistory";
CREATE TABLE "public"."TreatmentHistory" (
  "treatmentHistoryId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "startDate" timestamptz(6) NOT NULL DEFAULT '2021-12-07 09:46:50.529+07'::timestamp with time zone,
  "endDate" timestamptz(6),
  "statusF" int2 NOT NULL DEFAULT 0,
  "userId" int4 NOT NULL,
  "isolationFacilityId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for RelatedUser
-- ----------------------------
DROP TABLE IF EXISTS "public"."RelatedUser";
CREATE TABLE "public"."RelatedUser" (
  "relatedId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "originUserId" int4 NOT NULL,
  "relatedUserId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for Province
-- ----------------------------
DROP TABLE IF EXISTS "public"."Province";
CREATE TABLE "public"."Province" (
  "id" int4 NOT NULL,
  "name" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "code" varchar(5) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for ProductPackage
-- ----------------------------
DROP TABLE IF EXISTS "public"."ProductPackage";
CREATE TABLE "public"."ProductPackage" (
  "productPackageId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "productPackageName" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "limitedProducts" int2 NOT NULL DEFAULT 1,
  "limitedInDay" int2 NOT NULL DEFAULT 1,
  "limitedInWeek" int2 NOT NULL DEFAULT 1,
  "limitedInMonth" int2 NOT NULL DEFAULT 1
)
;

-- ----------------------------
-- Table structure for ProductInPackage
-- ----------------------------
DROP TABLE IF EXISTS "public"."ProductInPackage";
CREATE TABLE "public"."ProductInPackage" (
  "productInPackageId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "maxQuantity" int2 NOT NULL DEFAULT 1,
  "quantity" int2 NOT NULL DEFAULT 1,
  "productId" int4 NOT NULL,
  "productPackageId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for ProductImage
-- ----------------------------
DROP TABLE IF EXISTS "public"."ProductImage";
CREATE TABLE "public"."ProductImage" (
  "productImageId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "src" text COLLATE "pg_catalog"."default" NOT NULL,
  "isThumbnail" bool NOT NULL DEFAULT false,
  "productId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for Product
-- ----------------------------
DROP TABLE IF EXISTS "public"."Product";
CREATE TABLE "public"."Product" (
  "productId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "productName" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "price" int4 NOT NULL DEFAULT 0,
  "unit" varchar(10) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for PaymentHistory
-- ----------------------------
DROP TABLE IF EXISTS "public"."PaymentHistory";
CREATE TABLE "public"."PaymentHistory" (
  "paymentHistoryId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "paymentDate" timestamptz(6) NOT NULL DEFAULT '2021-12-07 09:46:50.519+07'::timestamp with time zone,
  "currentBalance" int4 NOT NULL DEFAULT 0,
  "paymentType" int2 NOT NULL DEFAULT 0,
  "paymentCode" uuid NOT NULL,
  "totalMoney" int4 NOT NULL DEFAULT 0,
  "userId" int4 NOT NULL,
  "consumptionHistoryId" int4
)
;

-- ----------------------------
-- Table structure for IsolationFacility
-- ----------------------------
DROP TABLE IF EXISTS "public"."IsolationFacility";
CREATE TABLE "public"."IsolationFacility" (
  "isolationFacilityId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "isolationFacilityName" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "capacity" int4 NOT NULL DEFAULT 1,
  "currentQuantity" int4 NOT NULL DEFAULT 0,
  "addressId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for District
-- ----------------------------
DROP TABLE IF EXISTS "public"."District";
CREATE TABLE "public"."District" (
  "id" int4 NOT NULL,
  "name" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "prefix" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "provinceId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for ConsumptionHistory
-- ----------------------------
DROP TABLE IF EXISTS "public"."ConsumptionHistory";
CREATE TABLE "public"."ConsumptionHistory" (
  "consumptionHistoryId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "buyDate" timestamptz(6) NOT NULL DEFAULT '2021-12-07 09:46:50.51+07'::timestamp with time zone,
  "totalPrice" int4 NOT NULL DEFAULT 0,
  "userId" int4 NOT NULL,
  "productPackageId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for AdminAccount
-- ----------------------------
DROP TABLE IF EXISTS "public"."AdminAccount";
CREATE TABLE "public"."AdminAccount" (
  "accountId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "username" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(72) COLLATE "pg_catalog"."default",
  "failedLoginTime" int2 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Table structure for Address
-- ----------------------------
DROP TABLE IF EXISTS "public"."Address";
CREATE TABLE "public"."Address" (
  "addressId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "details" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "wardId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for AccountHistory
-- ----------------------------
DROP TABLE IF EXISTS "public"."AccountHistory";
CREATE TABLE "public"."AccountHistory" (
  "accountHistoryId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "activity" text COLLATE "pg_catalog"."default" NOT NULL,
  "createdDate" timestamptz(6) NOT NULL DEFAULT '2021-12-07 09:46:50.487+07'::timestamp with time zone,
  "accountId" int4 NOT NULL
)
;

-- ----------------------------
-- Table structure for Account
-- ----------------------------
DROP TABLE IF EXISTS "public"."Account";
CREATE TABLE "public"."Account" (
  "accountId" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  "username" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(72) COLLATE "pg_catalog"."default",
  "accountType" int2 NOT NULL DEFAULT 0,
  "isLocked" bool NOT NULL DEFAULT false,
  "failedLoginTime" int2 NOT NULL DEFAULT 0
)
;

-- ----------------------------
-- Primary Key structure for table Ward
-- ----------------------------
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- ----------------------------
-- Primary Key structure for table TreatmentHistory
-- ----------------------------
ALTER TABLE "public"."TreatmentHistory" ADD CONSTRAINT "TreatmentHistory_pkey" PRIMARY KEY ("treatmentHistoryId");

-- ----------------------------
-- Primary Key structure for table RelatedUser
-- ----------------------------
ALTER TABLE "public"."RelatedUser" ADD CONSTRAINT "RelatedUser_pkey" PRIMARY KEY ("relatedId");

-- ----------------------------
-- Primary Key structure for table Province
-- ----------------------------
ALTER TABLE "public"."Province" ADD CONSTRAINT "Province_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ProductPackage
-- ----------------------------
ALTER TABLE "public"."ProductPackage" ADD CONSTRAINT "ProductPackage_pkey" PRIMARY KEY ("productPackageId");

-- ----------------------------
-- Primary Key structure for table ProductInPackage
-- ----------------------------
ALTER TABLE "public"."ProductInPackage" ADD CONSTRAINT "ProductInPackage_pkey" PRIMARY KEY ("productInPackageId");

-- ----------------------------
-- Primary Key structure for table ProductImage
-- ----------------------------
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("productImageId");

-- ----------------------------
-- Primary Key structure for table Product
-- ----------------------------
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("productId");

-- ----------------------------
-- Primary Key structure for table PaymentHistory
-- ----------------------------
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("paymentHistoryId");

-- ----------------------------
-- Primary Key structure for table IsolationFacility
-- ----------------------------
ALTER TABLE "public"."IsolationFacility" ADD CONSTRAINT "IsolationFacility_pkey" PRIMARY KEY ("isolationFacilityId");

-- ----------------------------
-- Primary Key structure for table District
-- ----------------------------
ALTER TABLE "public"."District" ADD CONSTRAINT "District_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ConsumptionHistory
-- ----------------------------
ALTER TABLE "public"."ConsumptionHistory" ADD CONSTRAINT "ConsumptionHistory_pkey" PRIMARY KEY ("consumptionHistoryId");

-- ----------------------------
-- Primary Key structure for table AdminAccount
-- ----------------------------
ALTER TABLE "public"."AdminAccount" ADD CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("accountId");

-- ----------------------------
-- Primary Key structure for table Address
-- ----------------------------
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId");

-- ----------------------------
-- Primary Key structure for table AccountHistory
-- ----------------------------
ALTER TABLE "public"."AccountHistory" ADD CONSTRAINT "AccountHistory_pkey" PRIMARY KEY ("accountHistoryId");

-- ----------------------------
-- Primary Key structure for table Account
-- ----------------------------
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId");

-- ----------------------------
-- Foreign Keys structure for table Ward
-- ----------------------------
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "public"."District" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address" ("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table TreatmentHistory
-- ----------------------------
ALTER TABLE "public"."TreatmentHistory" ADD CONSTRAINT "TreatmentHistory_isolationFacilityId_fkey" FOREIGN KEY ("isolationFacilityId") REFERENCES "public"."IsolationFacility" ("isolationFacilityId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."TreatmentHistory" ADD CONSTRAINT "TreatmentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table RelatedUser
-- ----------------------------
ALTER TABLE "public"."RelatedUser" ADD CONSTRAINT "RelatedUser_originUserId_fkey" FOREIGN KEY ("originUserId") REFERENCES "public"."User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."RelatedUser" ADD CONSTRAINT "RelatedUser_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "public"."User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ProductInPackage
-- ----------------------------
ALTER TABLE "public"."ProductInPackage" ADD CONSTRAINT "ProductInPackage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product" ("productId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ProductInPackage" ADD CONSTRAINT "ProductInPackage_productPackageId_fkey" FOREIGN KEY ("productPackageId") REFERENCES "public"."ProductPackage" ("productPackageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ProductImage
-- ----------------------------
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product" ("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table PaymentHistory
-- ----------------------------
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_consumptionHistoryId_fkey" FOREIGN KEY ("consumptionHistoryId") REFERENCES "public"."ConsumptionHistory" ("consumptionHistoryId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table IsolationFacility
-- ----------------------------
ALTER TABLE "public"."IsolationFacility" ADD CONSTRAINT "IsolationFacility_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address" ("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table District
-- ----------------------------
ALTER TABLE "public"."District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "public"."Province" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ConsumptionHistory
-- ----------------------------
ALTER TABLE "public"."ConsumptionHistory" ADD CONSTRAINT "ConsumptionHistory_productPackageId_fkey" FOREIGN KEY ("productPackageId") REFERENCES "public"."ProductPackage" ("productPackageId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."ConsumptionHistory" ADD CONSTRAINT "ConsumptionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Address
-- ----------------------------
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "public"."Ward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table AccountHistory
-- ----------------------------
ALTER TABLE "public"."AccountHistory" ADD CONSTRAINT "AccountHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;