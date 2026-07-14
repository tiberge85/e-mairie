-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITOYEN', 'AGENT', 'OFFICIER');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "TypeDeclarant" AS ENUM ('Pere', 'Mere', 'Tuteur', 'SageFemme', 'AgentDeSante', 'Autre');

-- CreateEnum
CREATE TYPE "StatutDeclaration" AS ENUM ('Brouillon', 'Soumis', 'EnVerification', 'PiecesDemandees', 'Valide', 'Refuse', 'ActeGenere', 'Disponible', 'Retire');

-- CreateTable
CREATE TABLE "citoyens" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenoms" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "motDePasseHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITOYEN',
    "telephoneVerifie" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citoyens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codes_otp" (
    "id" TEXT NOT NULL,
    "citoyenId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "consomme" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codes_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declarations_naissance" (
    "id" TEXT NOT NULL,
    "numeroSuivi" TEXT NOT NULL,
    "numeroActeOfficiel" TEXT,
    "statut" "StatutDeclaration" NOT NULL DEFAULT 'Brouillon',
    "citoyenId" TEXT NOT NULL,
    "enfant" JSONB NOT NULL,
    "pere" JSONB NOT NULL,
    "mere" JSONB NOT NULL,
    "typeDeclarant" "TypeDeclarant" NOT NULL,
    "motifRefus" TEXT,
    "soumisLe" TIMESTAMP(3),
    "valideLe" TIMESTAMP(3),
    "genereLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "declarations_naissance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transitions_statut" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "ancienStatut" "StatutDeclaration",
    "nouveauStatut" "StatutDeclaration" NOT NULL,
    "auteurId" TEXT,
    "motif" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transitions_statut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "cheminStockage" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "citoyenId" TEXT,
    "texteOcr" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "precedentId" TEXT,
    "archiveLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "citoyens_telephone_key" ON "citoyens"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "citoyens_email_key" ON "citoyens"("email");

-- CreateIndex
CREATE INDEX "codes_otp_citoyenId_idx" ON "codes_otp"("citoyenId");

-- CreateIndex
CREATE UNIQUE INDEX "declarations_naissance_numeroSuivi_key" ON "declarations_naissance"("numeroSuivi");

-- CreateIndex
CREATE UNIQUE INDEX "declarations_naissance_numeroActeOfficiel_key" ON "declarations_naissance"("numeroActeOfficiel");

-- CreateIndex
CREATE INDEX "declarations_naissance_citoyenId_idx" ON "declarations_naissance"("citoyenId");

-- CreateIndex
CREATE INDEX "declarations_naissance_statut_idx" ON "declarations_naissance"("statut");

-- CreateIndex
CREATE INDEX "transitions_statut_declarationId_idx" ON "transitions_statut"("declarationId");

-- CreateIndex
CREATE INDEX "documents_entite_entiteId_idx" ON "documents"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "documents_citoyenId_idx" ON "documents"("citoyenId");

-- AddForeignKey
ALTER TABLE "codes_otp" ADD CONSTRAINT "codes_otp_citoyenId_fkey" FOREIGN KEY ("citoyenId") REFERENCES "citoyens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarations_naissance" ADD CONSTRAINT "declarations_naissance_citoyenId_fkey" FOREIGN KEY ("citoyenId") REFERENCES "citoyens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transitions_statut" ADD CONSTRAINT "transitions_statut_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "declarations_naissance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transitions_statut" ADD CONSTRAINT "transitions_statut_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "citoyens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_precedentId_fkey" FOREIGN KEY ("precedentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

