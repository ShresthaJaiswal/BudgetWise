--
-- PostgreSQL database dump
--

O1TaEWsjrjLTLLBe1zUv60ruDMR9lLOTqtYQVWwLyvorwdLGvmtdVGKUxiz2zjk

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
-- Name: group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."group" (
    id integer NOT NULL,
    name text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by integer NOT NULL,
    status integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."group" OWNER TO postgres;

--
-- Name: group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_id_seq OWNER TO postgres;

--
-- Name: group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_id_seq OWNED BY public."group".id;


--
-- Name: group_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_transaction (
    id integer NOT NULL,
    group_id integer NOT NULL,
    transaction_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer NOT NULL
);


ALTER TABLE public.group_transaction OWNER TO postgres;

--
-- Name: group_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_transaction_id_seq OWNER TO postgres;

--
-- Name: group_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_transaction_id_seq OWNED BY public.group_transaction.id;


--
-- Name: password_reset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset (
    id integer NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    phone text
);


ALTER TABLE public.password_reset OWNER TO postgres;

--
-- Name: password_reset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_id_seq OWNER TO postgres;

--
-- Name: password_reset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_id_seq OWNED BY public.password_reset.id;


--
-- Name: transaction_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_category (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.transaction_category OWNER TO postgres;

--
-- Name: transaction_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_category_id_seq OWNER TO postgres;

--
-- Name: transaction_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_category_id_seq OWNED BY public.transaction_category.id;


--
-- Name: transaction_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_type (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.transaction_type OWNER TO postgres;

--
-- Name: transaction_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_type_id_seq OWNER TO postgres;

--
-- Name: transaction_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_type_id_seq OWNED BY public.transaction_type.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    category_id integer NOT NULL,
    type_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by integer NOT NULL,
    status integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
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
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    phone text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: group id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."group" ALTER COLUMN id SET DEFAULT nextval('public.group_id_seq'::regclass);


--
-- Name: group_transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_transaction ALTER COLUMN id SET DEFAULT nextval('public.group_transaction_id_seq'::regclass);


--
-- Name: password_reset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset ALTER COLUMN id SET DEFAULT nextval('public.password_reset_id_seq'::regclass);


--
-- Name: transaction_category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_category ALTER COLUMN id SET DEFAULT nextval('public.transaction_category_id_seq'::regclass);


--
-- Name: transaction_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_type ALTER COLUMN id SET DEFAULT nextval('public.transaction_type_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f094c238-2d4e-4cc9-a2dd-a67d56ff4822	6bf03178d8694f0c43fb5e42ddeae11119e45d00d2261e0cae6c15924a496d16	2026-03-09 14:25:31.886738+05:30	20260223071402_init	\N	\N	2026-03-09 14:25:31.850844+05:30	1
a99db6f0-1654-49f3-98b0-cc0f4e13f100	e369aaff1c8ecdc41186bd361e61fcad0fee490e11d29b29ba9d29fa1ac6ded2	2026-03-09 14:25:31.895678+05:30	20260224072314_init	\N	\N	2026-03-09 14:25:31.887549+05:30	1
51e00d00-1b41-4713-8db7-142359454973	200a16c377d1c81e92463e8a2d23bbf8c34c3fe2dfead9ec333a16ba6a6a0baf	2026-03-09 14:25:31.899662+05:30	20260225093910_add_currency_to_user	\N	\N	2026-03-09 14:25:31.896451+05:30	1
fd176513-faef-4b61-b347-af6469c15395	de04071b841f83845b749030722614deda1592440459c6551148055e0891d599	2026-03-09 14:25:31.941481+05:30	20260227051617_rename_tables	\N	\N	2026-03-09 14:25:31.900381+05:30	1
8232734c-7213-4973-8d37-bd894c611557	96334ddfd80d5e764bff9ba645e93413b21915bb59085cd47fdcf1db4fd27640	2026-03-09 14:25:31.98234+05:30	20260227052801_rename_user_id_to_user_id_and_add_type_category_tables	\N	\N	2026-03-09 14:25:31.942442+05:30	1
c615c53d-4bde-4026-8caf-28c282235451	195b4233d686be5f5221fcb72d8a4f07079e26c97b9045271786c580008b4ef2	2026-03-09 14:25:31.988703+05:30	20260227053558_rename_created_and_updated_fields	\N	\N	2026-03-09 14:25:31.983199+05:30	1
3238afe9-07ed-4364-9dab-913296d8688f	cb83ee0cbb3857fb9b8855f101a58f68f06e313917105209ff004a8c8c06c8aa	2026-03-09 14:25:31.993676+05:30	20260227063550_add_created_at_to_tables	\N	\N	2026-03-09 14:25:31.989466+05:30	1
2a933c51-17e6-442c-912a-888c5be4b347	520d33f8bdac01856a8f129fbeb1a5098dd20bb28e90686c3760a4b5f1cdb126	2026-03-09 14:25:32.010913+05:30	20260227104241_add_password_reset	\N	\N	2026-03-09 14:25:31.994937+05:30	1
b4e3e254-4ba9-48e3-94f1-3d1c4194e78f	6b078a8f6a52aa8c62d08bef700b459ca15aa900268ed85272009c668614df17	2026-03-09 14:29:01.245044+05:30	20260309085901_add_status_defaults	\N	\N	2026-03-09 14:29:01.232484+05:30	1
e5c3f685-2e96-4bb6-9ed4-96e209565358	d16a9a4bd19a9ae3ea50c35d9ba9a3b022c9fda221427ccf04055b93298ec946	2026-03-09 15:10:32.348776+05:30	20260309094032_add_composite_index	\N	\N	2026-03-09 15:10:32.33043+05:30	1
1f086d40-fd8a-4bd0-9e58-e17521a9ebcf	3c4638396c822c7baac3b3b34ffe112c7148a2e1c940e898f6fb89a891a27527	2026-03-16 13:08:19.039795+05:30	20260316073818_add_groups	\N	\N	2026-03-16 13:08:18.99158+05:30	1
48aae0f5-43c7-4f14-8ed7-7dfba1535d38	2721b5d6c904601198318f89b24e5feb018ddf44312a0d948c1e8823af4d0b2f	2026-03-17 15:05:16.260112+05:30	20260317093516_add_phone_to_user	\N	\N	2026-03-17 15:05:16.254807+05:30	1
e4da8cf1-8e24-4a5b-8450-1cad67c51800	5886846c4ba17d499c0a3fd8724dd587cde4d5bfa8ecd934219dbab377aeafdc	2026-03-25 11:21:10.344002+05:30	20260325055110_add_unique_phone	\N	\N	2026-03-25 11:21:10.331462+05:30	1
\.


--
-- Data for Name: group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."group" (id, name, user_id, created_at, created_by, updated_at, updated_by, status) FROM stdin;
1	new group	1	2026-03-16 08:29:53.628	1	2026-03-16 10:40:11.064	1	1
2	new 2	1	2026-03-16 08:41:26.845	1	2026-03-17 06:10:00.259	1	0
3	my spendings	1	2026-03-17 08:40:48.46	1	2026-03-17 08:40:48.46	1	1
4	Work	1	2026-03-17 11:47:40.524	1	2026-03-17 11:47:40.524	1	1
5	demo	1	2026-03-19 10:19:17.378	1	2026-03-19 10:19:17.378	1	1
6	demo 1	1	2026-03-19 10:19:27.47	1	2026-03-19 10:19:27.47	1	1
8	a very long group name	1	2026-03-19 10:25:07.126	1	2026-03-19 10:25:07.126	1	1
9	test new	1	2026-03-19 10:31:18.712	1	2026-03-19 10:37:43.393	1	0
7	demo 2	1	2026-03-19 10:19:32.304	1	2026-03-19 10:37:46.835	1	0
11	another one	1	2026-03-19 10:37:34.828	1	2026-03-19 10:40:20.211	1	0
10	another one	1	2026-03-19 10:37:24.228	1	2026-03-19 10:40:22.016	1	0
15	test	1	2026-03-19 10:43:58.486	1	2026-03-19 10:44:08.606	1	1
13	traial 2	1	2026-03-19 10:40:39.333	1	2026-03-19 10:44:19.097	1	0
14	new	1	2026-03-19 10:41:00.229	1	2026-03-19 10:44:20.401	1	0
12	trial	1	2026-03-19 10:40:26.052	1	2026-03-19 10:44:22.166	1	0
16	new	2	2026-03-25 05:30:40.682	2	2026-03-25 05:41:31.426	2	0
\.


--
-- Data for Name: group_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_transaction (id, group_id, transaction_id, created_at, created_by) FROM stdin;
3	1	2	2026-03-16 09:54:04.253	1
14	1	5	2026-03-16 11:36:21.276	1
15	3	5	2026-03-17 08:40:55.667	1
16	3	1	2026-03-17 08:40:55.672	1
17	4	7	2026-03-17 11:47:49.588	1
18	4	6	2026-03-17 11:47:49.598	1
19	15	9	2026-03-19 10:44:08.651	1
20	15	5	2026-03-19 10:44:08.667	1
21	15	8	2026-03-19 10:45:41.65	1
22	16	13	2026-03-25 05:30:44.662	2
23	16	12	2026-03-25 05:30:44.664	2
\.


--
-- Data for Name: password_reset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset (id, email, otp, created_at, expires_at, phone) FROM stdin;
\.


--
-- Data for Name: transaction_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_category (id, name, created_at, status) FROM stdin;
1	Food & Dining	2026-03-09 08:59:29.007	1
2	Transport	2026-03-09 08:59:29.007	1
3	Shopping	2026-03-09 08:59:29.007	1
4	Entertainment	2026-03-09 08:59:29.007	1
5	Healthcare	2026-03-09 08:59:29.007	1
6	Utilities	2026-03-09 08:59:29.007	1
7	Salary	2026-03-09 08:59:29.007	1
8	Freelance	2026-03-09 08:59:29.007	1
9	Investment	2026-03-09 08:59:29.007	1
10	Refund	2026-03-09 08:59:29.007	1
11	Other	2026-03-09 08:59:29.007	1
\.


--
-- Data for Name: transaction_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_type (id, name, created_at, status) FROM stdin;
1	income	2026-03-09 08:59:29	1
2	expense	2026-03-09 08:59:29	1
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, description, amount, category_id, type_id, user_id, created_at, created_by, updated_at, updated_by, status) FROM stdin;
1	apples	399	1	2	1	2026-03-10 08:44:04.44	1	2026-03-10 08:44:04.44	1	1
3	grocery new	729	5	2	1	2026-03-10 09:31:03.389	1	2026-03-10 09:39:10.128	1	0
2	salary	130000	7	1	1	2026-03-10 09:26:04.861	1	2026-03-12 11:47:37.796	1	1
5	apples	399	1	2	1	2026-03-12 12:00:10.557	1	2026-03-16 11:45:00.982	1	1
4	apples	399	1	2	1	2026-03-12 11:59:48.598	1	2026-03-17 06:09:31.678	1	0
6	laptop	96000	6	2	1	2026-03-17 11:46:52.393	1	2026-03-17 11:46:52.393	1	1
7	bag	4500	3	2	1	2026-03-17 11:47:07.053	1	2026-03-17 11:47:07.053	1	1
8	refund	499	1	1	1	2026-03-17 11:48:52.8	1	2026-03-17 11:48:52.8	1	1
9	games	5000	4	2	1	2026-03-19 10:11:15.599	1	2026-03-19 10:11:15.599	1	1
10	rent	14000	6	2	2	2026-03-24 09:22:54.364	2	2026-03-24 09:22:54.364	2	1
11	ggg	100000	7	2	2	2026-03-24 09:23:55.225	2	2026-03-24 09:23:55.225	2	1
12	new	600	10	2	2	2026-03-25 05:30:13.616	2	2026-03-25 05:30:13.616	2	1
13	new77	89273	9	2	2	2026-03-25 05:30:34.557	2	2026-03-25 05:30:34.557	2	1
14	notebook	300	6	2	2	2026-03-25 06:14:15.032	2	2026-03-25 06:14:15.032	2	1
15	books	689	6	2	38	2026-03-25 06:15:40.795	38	2026-03-25 06:15:40.795	38	1
16	dzgv	34	10	2	38	2026-03-25 06:41:15.27	38	2026-03-25 06:41:15.27	38	1
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, password, currency, created_at, updated_at, phone) FROM stdin;
1	Shrestha	prof.nith@gmail.com	$2b$10$4fJW.bMShZQQkNuM5H1sLuhObKOg9n7NFN76RnKfbyI3wkTkwoFvG	INR	2026-03-10 06:23:24.255	2026-03-10 08:06:40.53	\N
2	swastik	swastkk@gmail.com	$2b$10$glvDpaZ7jClT5SslS/D..uqbj/xzcSQEEpXSAmOOKKLRazvfVqAMC	INR	2026-03-24 09:19:31.718	2026-03-24 09:19:31.718	6203696920
38	Test User	21bec072@nith.ac.in	$2b$10$BGtJyjR9WLFphzEtXwPTiOv..pW0jTrNeDzR1GO/sJrNz5o2Z67HS	INR	2026-03-25 05:28:12.125	2026-03-25 05:28:12.125	7070999155
\.


--
-- Name: group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_id_seq', 16, true);


--
-- Name: group_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_transaction_id_seq', 23, true);


--
-- Name: password_reset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_id_seq', 14, true);


--
-- Name: transaction_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_category_id_seq', 11, true);


--
-- Name: transaction_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_type_id_seq', 2, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 16, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 38, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: group group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_pkey PRIMARY KEY (id);


--
-- Name: group_transaction group_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_transaction
    ADD CONSTRAINT group_transaction_pkey PRIMARY KEY (id);


--
-- Name: password_reset password_reset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset
    ADD CONSTRAINT password_reset_pkey PRIMARY KEY (id);


--
-- Name: transaction_category transaction_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_category
    ADD CONSTRAINT transaction_category_pkey PRIMARY KEY (id);


--
-- Name: transaction_type transaction_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_type
    ADD CONSTRAINT transaction_type_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: group_transaction_group_id_transaction_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX group_transaction_group_id_transaction_id_key ON public.group_transaction USING btree (group_id, transaction_id);


--
-- Name: transaction_category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transaction_category_name_key ON public.transaction_category USING btree (name);


--
-- Name: transaction_type_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transaction_type_name_key ON public.transaction_type USING btree (name);


--
-- Name: transactions_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_category_id_idx ON public.transactions USING btree (category_id);


--
-- Name: transactions_type_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_type_id_idx ON public.transactions USING btree (type_id);


--
-- Name: transactions_user_id_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_user_id_status_idx ON public.transactions USING btree (user_id, status);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: user_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_phone_key ON public."user" USING btree (phone);


--
-- Name: group_transaction group_transaction_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_transaction
    ADD CONSTRAINT group_transaction_group_id_fkey FOREIGN KEY (group_id) REFERENCES public."group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_transaction group_transaction_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_transaction
    ADD CONSTRAINT group_transaction_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.transaction_category(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.transaction_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict O1TaEWsjrjLTLLBe1zUv60ruDMR9lLOTqtYQVWwLyvorwdLGvmtdVGKUxiz2zjk

