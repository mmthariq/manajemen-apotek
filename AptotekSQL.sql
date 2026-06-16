--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2026-06-14 13:01:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 897 (class 1247 OID 25183)
-- Name: DrugCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DrugCategory" AS ENUM (
    'BEBAS',
    'BEBAS_TERBATAS',
    'KERAS'
);


ALTER TYPE public."DrugCategory" OWNER TO postgres;

--
-- TOC entry 864 (class 1247 OID 23920)
-- Name: OrderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderType" AS ENUM (
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE public."OrderType" OWNER TO postgres;

--
-- TOC entry 861 (class 1247 OID 23910)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'KASIR',
    'CUSTOMER',
    'OWNER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 867 (class 1247 OID 23926)
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'PENDING',
    'VERIFIED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 23900)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 23977)
-- Name: custom_medicine_components; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_medicine_components (
    id integer NOT NULL,
    "customMedicineId" integer NOT NULL,
    "drugId" integer NOT NULL,
    quantity integer NOT NULL,
    unit text NOT NULL
);


ALTER TABLE public.custom_medicine_components OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 23976)
-- Name: custom_medicine_components_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_medicine_components_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_medicine_components_id_seq OWNER TO postgres;

--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 224
-- Name: custom_medicine_components_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_medicine_components_id_seq OWNED BY public.custom_medicine_components.id;


--
-- TOC entry 223 (class 1259 OID 23967)
-- Name: custom_medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_medicines (
    id integer NOT NULL,
    name text NOT NULL,
    price double precision NOT NULL,
    stock integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.custom_medicines OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 23966)
-- Name: custom_medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.custom_medicines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_medicines_id_seq OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 222
-- Name: custom_medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.custom_medicines_id_seq OWNED BY public.custom_medicines.id;


--
-- TOC entry 221 (class 1259 OID 23957)
-- Name: drugs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drugs (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    stock integer NOT NULL,
    unit text NOT NULL,
    price double precision NOT NULL,
    "expiredDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supplierId" integer,
    category public."DrugCategory" DEFAULT 'BEBAS'::public."DrugCategory" NOT NULL,
    "purchasePrice" double precision
);


ALTER TABLE public.drugs OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 23956)
-- Name: drugs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drugs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drugs_id_seq OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 220
-- Name: drugs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drugs_id_seq OWNED BY public.drugs.id;


--
-- TOC entry 233 (class 1259 OID 24014)
-- Name: purchase_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_details (
    id integer NOT NULL,
    "purchaseId" integer NOT NULL,
    "drugId" integer NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    subtotal double precision NOT NULL,
    "expiredDate" timestamp(3) without time zone
);


ALTER TABLE public.purchase_details OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24013)
-- Name: purchase_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_details_id_seq OWNER TO postgres;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 232
-- Name: purchase_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_details_id_seq OWNED BY public.purchase_details.id;


--
-- TOC entry 231 (class 1259 OID 24004)
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    "purchaseCode" text NOT NULL,
    "totalPrice" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supplierId" integer NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24003)
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO postgres;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 230
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- TOC entry 219 (class 1259 OID 23947)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    phone text,
    email text,
    address text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 23946)
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 218
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 229 (class 1259 OID 23997)
-- Name: transaction_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_details (
    id integer NOT NULL,
    "transactionId" integer NOT NULL,
    "drugId" integer,
    "customMedicineId" integer,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    subtotal double precision NOT NULL,
    "componentsSnapshot" text
);


ALTER TABLE public.transaction_details OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 23996)
-- Name: transaction_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_details_id_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 228
-- Name: transaction_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_details_id_seq OWNED BY public.transaction_details.id;


--
-- TOC entry 227 (class 1259 OID 23986)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    "orderCode" text NOT NULL,
    type public."OrderType" NOT NULL,
    status public."Status" DEFAULT 'PENDING'::public."Status" NOT NULL,
    "totalPrice" double precision NOT NULL,
    "paymentProofImageUrl" text,
    "prescriptionImageUrl" text,
    "usageInstructions" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cashierId" integer,
    "customerId" integer
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 23985)
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 226
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 217 (class 1259 OID 23936)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text,
    password text NOT NULL,
    role public."Role" NOT NULL,
    phone text,
    address text,
    "isMember" boolean DEFAULT false NOT NULL,
    "membershipStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 23935)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4756 (class 2604 OID 23980)
-- Name: custom_medicine_components id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicine_components ALTER COLUMN id SET DEFAULT nextval('public.custom_medicine_components_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 23970)
-- Name: custom_medicines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicines ALTER COLUMN id SET DEFAULT nextval('public.custom_medicines_id_seq'::regclass);


--
-- TOC entry 4751 (class 2604 OID 23960)
-- Name: drugs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drugs ALTER COLUMN id SET DEFAULT nextval('public.drugs_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 24017)
-- Name: purchase_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details ALTER COLUMN id SET DEFAULT nextval('public.purchase_details_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 24007)
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 23950)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 4760 (class 2604 OID 24000)
-- Name: transaction_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_details ALTER COLUMN id SET DEFAULT nextval('public.transaction_details_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 23989)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4746 (class 2604 OID 23939)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4955 (class 0 OID 23900)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
59aba2e1-fe90-486f-92df-857633bffc71	9dcce365d4d3dc7c9998447d37926c7aad808fd1bab0ac5ca00752c5fff6da1d	2026-04-20 08:49:54.815327+07	20260420014954_init_apotek_baru	\N	\N	2026-04-20 08:49:54.444131+07	1
b45c2603-bcf2-4e00-b6e8-5d2f6ea02bc8	663757b56a57b5890d625b47e956cc8b2e6c170bfbe6d57b2aa04f099c43abdc	2026-04-28 09:37:03.549724+07	20260428023703_add_components_snapshot	\N	\N	2026-04-28 09:37:03.48619+07	1
3bb28b48-a9d7-41dc-941b-d91a10e92511	d089d3279b39672b203a33e096a3cdd11a775290a102cbf940583635f80256ec	2026-04-30 08:49:11.606538+07	20260430014911_add_supplier_id_to_drugs	\N	\N	2026-04-30 08:49:11.498839+07	1
9d859400-a2ea-4125-80cd-51817317a08a	e21489cfca87667b5a41850aa487440cfd997ac5827d4b11043f2fcf40ba6078	2026-05-25 21:59:11.986145+07	20260525145911_add_drug_category_and_purchase_price	\N	\N	2026-05-25 21:59:11.805214+07	1
\.


--
-- TOC entry 4965 (class 0 OID 23977)
-- Dependencies: 225
-- Data for Name: custom_medicine_components; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_medicine_components (id, "customMedicineId", "drugId", quantity, unit) FROM stdin;
3	6	40	1	tablet
4	6	14	1	tablet
\.


--
-- TOC entry 4963 (class 0 OID 23967)
-- Dependencies: 223
-- Data for Name: custom_medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_medicines (id, name, price, stock, "createdAt", "updatedAt") FROM stdin;
6	Racikan Flu Anak	6003	1	2026-05-29 10:28:55.058	2026-05-29 10:28:55.058
\.


--
-- TOC entry 4961 (class 0 OID 23957)
-- Dependencies: 221
-- Data for Name: drugs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drugs (id, name, description, stock, unit, price, "expiredDate", "createdAt", "updatedAt", "supplierId", category, "purchasePrice") FROM stdin;
1	Meloxicam 15 mg	Data opname produk Meloxicam 15 mg dengan satuan Stp.	43	Stp	7003.5	2025-03-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	6090
3	Methylprednisolone 8mg	Data opname produk Methylprednisolone 8mg dengan satuan Stp.	20	Stp	8625	2026-07-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 10:30:56.677	1	KERAS	7500
4	Methylprednisolone 16mg	Data opname produk Methylprednisolone 16mg dengan satuan Stp.	16	Stp	12006	2025-10-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	10440
5	Nifedipine 10mg	Data opname produk Nifedipine 10mg dengan satuan Stp.	29	Stp	3001.5	2027-07-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	2610
6	Piroxicam 10mg	Data opname produk Piroxicam 10mg dengan satuan Stp.	22	Stp	2285.05	2025-07-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	1987
7	Piroxicam 20mg	Data opname produk Piroxicam 20mg dengan satuan Stp.	162	Stp	3001.5	2026-12-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	2610
8	Propranolol 10mg	Data opname produk Propranolol 10mg dengan satuan Stp.	42	Stp	3001.5	2025-08-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	2610
9	Pyrazinamide 500mg	Data opname produk Pyrazinamide 500mg dengan satuan Stp.	7	Stp	3657	2026-06-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	3180
10	Propylthiouracil 100mg	Data opname produk Propylthiouracil 100mg dengan satuan Stp.	5	Stp	8004	2025-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	6960
11	Spironolactone 100mg	Data opname produk Spironolactone 100mg dengan satuan Stp.	20	Stp	13006.5	2025-11-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	11310
12	Simvastatin 10mg	Data opname produk Simvastatin 10mg dengan satuan Stp.	38	Stp	5002.5	2026-08-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	4350
13	Simvastatin 20mg	Data opname produk Simvastatin 20mg dengan satuan Stp.	9	Stp	10005	2026-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	8700
14	Salbutamol 2mg	Data opname produk Salbutamol 2mg dengan satuan Stp.	45	Stp	3001.5	2026-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	2610
15	Salbutamol 4mg	Data opname produk Salbutamol 4mg dengan satuan Stp.	17	Stp	3001.5	2027-05-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	2610
16	Omeprazole	Data opname produk Omeprazole dengan satuan Stp.	61	Stp	6003	2026-06-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	5220
17	Ondansetron 4mg	Data opname produk Ondansetron 4mg dengan satuan Stp.	5	Stp	5002.5	2027-04-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	4350
18	Ondansetron 8mg	Data opname produk Ondansetron 8mg dengan satuan Stp.	13	Stp	23011.5	2027-03-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	20010
19	Rifampicin 450mg	Data opname produk Rifampicin 450mg dengan satuan Stp.	17	Stp	21010.5	2026-09-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	18270
20	Piracetam 400mg	Data opname produk Piracetam 400mg dengan satuan Stp.	0	Stp	5002.5	2026-02-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	4350
21	Ranitidine	Data opname produk Ranitidine dengan satuan Stp.	32	Stp	3001.5	2025-03-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	2610
22	Diabetasol Vanilla 180gr	Data opname produk Diabetasol Vanilla 180gr dengan satuan Box.	3	Box	52014.5	2027-07-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	BEBAS	45230
23	Sari Kurma Sahara Original	Data opname produk Sari Kurma Sahara Original dengan satuan Fls.	6	Fls	23011.5	2027-10-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	BEBAS	20010
24	Cotrimoxazole	Data opname produk Cotrimoxazole dengan satuan Stp.	4	Stp	3001.5	2025-08-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	2610
25	Digoxin	Data opname produk Digoxin dengan satuan Stp.	30	Stp	3001.5	2025-06-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	2610
26	Doxycycline 100mg	Data opname produk Doxycycline 100mg dengan satuan Stp.	9	Stp	10005	2026-02-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	8700
27	Domperidone	Data opname produk Domperidone dengan satuan Stp.	20	Stp	5002.5	2025-09-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	4350
28	Diclofenac Sodium	Data opname produk Diclofenac Sodium dengan satuan Stp.	36	Stp	5002.5	2025-06-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	4350
29	Furosemide	Data opname produk Furosemide dengan satuan Stp.	19	Stp	3001.5	2027-12-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	2610
30	Glimepiride 1mg	Data opname produk Glimepiride 1mg dengan satuan Stp.	17	Stp	8004	2026-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	6960
31	Glimepiride 2mg	Data opname produk Glimepiride 2mg dengan satuan Stp.	15	Stp	10005	2025-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	8700
32	Glimepiride 3mg	Data opname produk Glimepiride 3mg dengan satuan Stp.	21	Stp	15007.5	2027-07-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	13050
33	Glimepiride 4mg	Data opname produk Glimepiride 4mg dengan satuan Stp.	62	Stp	19009.5	2026-04-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	16530
34	Glibenclamide	Data opname produk Glibenclamide dengan satuan Stp.	19	Stp	3001.5	2027-02-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	2610
35	Ibuprofen 400mg	Data opname produk Ibuprofen 400mg dengan satuan Stp.	40	Stp	3501.75	2026-11-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	BEBAS_TERBATAS	3045
36	Ketoconazole 200mg	Data opname produk Ketoconazole 200mg dengan satuan Stp.	22	Stp	6003	2025-02-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	5220
37	Lansoprazole	Data opname produk Lansoprazole dengan satuan Stp.	62	Stp	13006.5	2025-12-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	KERAS	11310
38	Levofloxacin 500mg	Data opname produk Levofloxacin 500mg dengan satuan Stp.	16	Stp	10505.25	2026-02-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	9135
39	Metronidazole 500 mg	Data opname produk Metronidazole 500 mg dengan satuan Stp.	15	Stp	5002.5	2027-06-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	KERAS	4350
40	Metformin 500 mg	Data opname produk Metformin 500 mg dengan satuan Stp.	43	Stp	3001.5	2026-11-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	3	KERAS	2610
41	Diabetasol Gula isi 25	Data opname produk Diabetasol Gula isi 25 dengan satuan Box.	3	Box	23011.5	2025-10-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	BEBAS	20010
42	Tropicana Slim isi 50	Data opname produk Tropicana Slim isi 50 dengan satuan Box.	3	Box	48024	2027-05-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	BEBAS	41760
43	Biolysin Multivitamin	Data opname produk Biolysin Multivitamin dengan satuan Fls.	5	Fls	15007.5	2025-04-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	BEBAS	13050
44	Cerebrofort Gold	Data opname produk Cerebrofort Gold dengan satuan Fls.	6	Fls	21010.5	2026-08-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	BEBAS	18270
45	Sanmol Sirup	Data opname produk Sanmol Sirup dengan satuan Fls.	21	Fls	20010	2025-01-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	2	BEBAS	17400
46	Stimuno Original 60ml	Data opname produk Stimuno Original 60ml dengan satuan Fls.	6	Fls	30015	2026-04-01 00:00:00	2026-05-29 08:11:06.131	2026-05-29 08:11:06.131	1	BEBAS	26100
2	Methylprednisolone 4mg	Data opname produk Methylprednisolone 4mg dengan satuan Stp.	50	Stp	6325	2026-07-31 00:00:00	2026-05-29 08:11:06.131	2026-05-29 10:22:12.964	1	KERAS	5500
\.


--
-- TOC entry 4973 (class 0 OID 24014)
-- Dependencies: 233
-- Data for Name: purchase_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_details (id, "purchaseId", "drugId", quantity, "unitPrice", subtotal, "expiredDate") FROM stdin;
1	1	2	1	5500	5500	2026-07-31 00:00:00
2	2	3	2	7500	15000	2027-05-29 00:00:00
\.


--
-- TOC entry 4971 (class 0 OID 24004)
-- Dependencies: 231
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, "purchaseCode", "totalPrice", "createdAt", "updatedAt", "supplierId") FROM stdin;
1	PUR-1780024932973-417	5500	2026-05-29 10:22:12.964	2026-05-29 10:22:12.964	1
2	PUR-1780025456682-8032	15000	2026-05-29 10:30:56.677	2026-05-29 10:30:56.677	1
\.


--
-- TOC entry 4959 (class 0 OID 23947)
-- Dependencies: 219
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, "contactPerson", phone, email, address, "createdAt", "updatedAt") FROM stdin;
1	PT Kalbe Farma	Budi	081234567890	\N	Jakarta	2026-05-29 08:11:06.047	2026-05-29 08:11:06.047
2	PT Sanbe Farma	Andi	081298765432	\N	Bandung	2026-05-29 08:11:06.052	2026-05-29 08:11:06.052
3	PT Dexa Medica	Cici	081211223344	\N	Tangerang	2026-05-29 08:11:06.054	2026-05-29 08:11:06.054
\.


--
-- TOC entry 4969 (class 0 OID 23997)
-- Dependencies: 229
-- Data for Name: transaction_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_details (id, "transactionId", "drugId", "customMedicineId", quantity, "unitPrice", subtotal, "componentsSnapshot") FROM stdin;
1	17	1	\N	1	7003.5	7003.5	\N
\.


--
-- TOC entry 4967 (class 0 OID 23986)
-- Dependencies: 227
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, "orderCode", type, status, "totalPrice", "paymentProofImageUrl", "prescriptionImageUrl", "usageInstructions", "createdAt", "updatedAt", "cashierId", "customerId") FROM stdin;
1	ORD-OFFLINE-seed-1776652899317-hkjip6k	OFFLINE	COMPLETED	14500	\N	\N	Paracetamol: 3x sehari 1 tablet sesudah makan. Cetirizine: 1x sehari 1 tablet malam hari.	2026-04-20 02:41:39.322	2026-04-20 02:41:39.322	2	\N
2	ORD-ONLINE-seed-1776652899398-2uotxqj	ONLINE	COMPLETED	70000	/uploads/payment-proofs/sample-proof.jpg	/uploads/prescriptions/sample-resep.jpg	Amoxicillin: 3x sehari 1 kapsul hingga habis (5 hari). Omeprazole: 1x sehari 1 kapsul sebelum makan pagi.	2026-04-20 02:41:39.401	2026-04-20 02:41:39.401	2	3
5	ORD-1777347000399-4174	ONLINE	COMPLETED	4500	/uploads/payment-proofs/payment-5-1777347234182.png	\N	\N	2026-04-28 10:30:00.4	2026-04-28 10:34:55.677	2	3
7	ORD-1777348096535-3404	ONLINE	COMPLETED	50000	/uploads/payment-proofs/payment-7-1777348110110.png	\N	\N	2026-04-28 10:48:16.535	2026-04-28 10:49:08.564	2	3
8	ORD-1777514691872-4289	ONLINE	COMPLETED	7500	/uploads/payment-proofs/payment-8-1777514742118.png	\N	\N	2026-04-30 09:04:51.873	2026-04-30 09:06:48.206	2	5
9	ORD-1777514890613-2564	OFFLINE	COMPLETED	35000	\N	\N	\N	2026-04-30 09:08:10.614	2026-04-30 09:08:10.614	2	\N
12	ORD-1778461557945-9696	ONLINE	PENDING	1500	\N	\N	\N	2026-05-11 08:05:57.946	2026-05-11 08:05:57.946	2	3
13	ORD-1779434723623-3641	ONLINE	PENDING	4500	\N	\N	\N	2026-05-22 14:25:23.624	2026-05-22 14:25:23.624	2	3
14	ORD-OFFLINE-seed-1779895180627-dgw33qz	OFFLINE	COMPLETED	14500	\N	\N	Paracetamol: 3x sehari 1 tablet sesudah makan. Cetirizine: 1x sehari 1 tablet malam hari.	2026-05-27 15:19:40.631	2026-05-27 15:19:40.631	2	\N
15	ORD-ONLINE-seed-1779895180718-5004dbj	ONLINE	COMPLETED	70000	/uploads/payment-proofs/sample-proof.jpg	/uploads/prescriptions/sample-resep.jpg	Amoxicillin: 3x sehari 1 kapsul hingga habis (5 hari). Omeprazole: 1x sehari 1 kapsul sebelum makan pagi.	2026-05-27 15:19:40.722	2026-05-27 15:19:40.722	2	3
16	ORD-ONLINE-seed-1779895180763-o4muvkk	ONLINE	PENDING	45000	\N	\N	\N	2026-05-27 15:19:40.767	2026-05-27 15:19:40.767	2	3
17	ORD-1780025245397-1507	ONLINE	PENDING	7003.5	\N	\N	\N	2026-05-29 10:27:25.394	2026-05-29 10:27:25.394	2	3
\.


--
-- TOC entry 4957 (class 0 OID 23936)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, phone, address, "isMember", "membershipStatus", "createdAt", "updatedAt") FROM stdin;
5	Messi	mthariiq10@gmail.com	$2a$10$Exl8zTSP./F.en8TXY0V4en.VjYV8mV8YI0deDub61eeW5qIRMS56	CUSTOMER	0810101010	Bojonegoro	t	active	2026-04-29 10:57:38.532	2026-04-29 10:59:19.347
1	admin	admin@apotek.local	123456	ADMIN	\N	\N	f	\N	2026-04-20 09:09:15.777	2026-05-29 08:11:05.731
2	kasir	kasir@apotek.local	123456	KASIR	\N	\N	f	\N	2026-04-20 09:09:16.127	2026-05-29 08:11:05.748
3	customer	customer@apotek.local	123456	CUSTOMER	\N	\N	t	active	2026-04-20 09:09:16.14	2026-05-29 08:11:05.749
4	owner	owner@apotek.local	123456	OWNER	\N	\N	f	\N	2026-04-20 09:09:16.141	2026-05-29 08:11:05.772
\.


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 224
-- Name: custom_medicine_components_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_medicine_components_id_seq', 4, true);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 222
-- Name: custom_medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_medicines_id_seq', 6, true);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 220
-- Name: drugs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drugs_id_seq', 46, true);


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 232
-- Name: purchase_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_details_id_seq', 2, true);


--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 230
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 2, true);


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 218
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 3, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 228
-- Name: transaction_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_details_id_seq', 1, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 226
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 17, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 4765 (class 2606 OID 23908)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4780 (class 2606 OID 23984)
-- Name: custom_medicine_components custom_medicine_components_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicine_components
    ADD CONSTRAINT custom_medicine_components_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 23975)
-- Name: custom_medicines custom_medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicines
    ADD CONSTRAINT custom_medicines_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 23965)
-- Name: drugs drugs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drugs
    ADD CONSTRAINT drugs_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 24019)
-- Name: purchase_details purchase_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 24012)
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 23955)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 24002)
-- Name: transaction_details transaction_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_details
    ADD CONSTRAINT transaction_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 23995)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 23945)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 1259 OID 24022)
-- Name: custom_medicine_components_customMedicineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "custom_medicine_components_customMedicineId_idx" ON public.custom_medicine_components USING btree ("customMedicineId");


--
-- TOC entry 4778 (class 1259 OID 24023)
-- Name: custom_medicine_components_drugId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "custom_medicine_components_drugId_idx" ON public.custom_medicine_components USING btree ("drugId");


--
-- TOC entry 4774 (class 1259 OID 24804)
-- Name: drugs_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "drugs_supplierId_idx" ON public.drugs USING btree ("supplierId");


--
-- TOC entry 4797 (class 1259 OID 24035)
-- Name: purchase_details_drugId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_details_drugId_idx" ON public.purchase_details USING btree ("drugId");


--
-- TOC entry 4800 (class 1259 OID 24034)
-- Name: purchase_details_purchaseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_details_purchaseId_idx" ON public.purchase_details USING btree ("purchaseId");


--
-- TOC entry 4795 (class 1259 OID 24032)
-- Name: purchases_purchaseCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "purchases_purchaseCode_key" ON public.purchases USING btree ("purchaseCode");


--
-- TOC entry 4796 (class 1259 OID 24033)
-- Name: purchases_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchases_supplierId_idx" ON public.purchases USING btree ("supplierId");


--
-- TOC entry 4788 (class 1259 OID 24031)
-- Name: transaction_details_customMedicineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_details_customMedicineId_idx" ON public.transaction_details USING btree ("customMedicineId");


--
-- TOC entry 4789 (class 1259 OID 24030)
-- Name: transaction_details_drugId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_details_drugId_idx" ON public.transaction_details USING btree ("drugId");


--
-- TOC entry 4792 (class 1259 OID 24029)
-- Name: transaction_details_transactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_details_transactionId_idx" ON public.transaction_details USING btree ("transactionId");


--
-- TOC entry 4781 (class 1259 OID 24027)
-- Name: transactions_cashierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transactions_cashierId_idx" ON public.transactions USING btree ("cashierId");


--
-- TOC entry 4782 (class 1259 OID 24028)
-- Name: transactions_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transactions_customerId_idx" ON public.transactions USING btree ("customerId");


--
-- TOC entry 4783 (class 1259 OID 24024)
-- Name: transactions_orderCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "transactions_orderCode_key" ON public.transactions USING btree ("orderCode");


--
-- TOC entry 4786 (class 1259 OID 24026)
-- Name: transactions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_status_idx ON public.transactions USING btree (status);


--
-- TOC entry 4787 (class 1259 OID 24025)
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- TOC entry 4766 (class 1259 OID 24021)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4769 (class 1259 OID 24020)
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- TOC entry 4802 (class 2606 OID 24036)
-- Name: custom_medicine_components custom_medicine_components_customMedicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicine_components
    ADD CONSTRAINT "custom_medicine_components_customMedicineId_fkey" FOREIGN KEY ("customMedicineId") REFERENCES public.custom_medicines(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4803 (class 2606 OID 24041)
-- Name: custom_medicine_components custom_medicine_components_drugId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_medicine_components
    ADD CONSTRAINT "custom_medicine_components_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES public.drugs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4801 (class 2606 OID 24805)
-- Name: drugs drugs_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drugs
    ADD CONSTRAINT "drugs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4810 (class 2606 OID 24081)
-- Name: purchase_details purchase_details_drugId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT "purchase_details_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES public.drugs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4811 (class 2606 OID 24076)
-- Name: purchase_details purchase_details_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT "purchase_details_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public.purchases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4809 (class 2606 OID 24071)
-- Name: purchases purchases_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4806 (class 2606 OID 24066)
-- Name: transaction_details transaction_details_customMedicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_details
    ADD CONSTRAINT "transaction_details_customMedicineId_fkey" FOREIGN KEY ("customMedicineId") REFERENCES public.custom_medicines(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4807 (class 2606 OID 24061)
-- Name: transaction_details transaction_details_drugId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_details
    ADD CONSTRAINT "transaction_details_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES public.drugs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4808 (class 2606 OID 24056)
-- Name: transaction_details transaction_details_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_details
    ADD CONSTRAINT "transaction_details_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4804 (class 2606 OID 24046)
-- Name: transactions transactions_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4805 (class 2606 OID 24051)
-- Name: transactions transactions_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-06-14 13:01:01

--
-- PostgreSQL database dump complete
--

