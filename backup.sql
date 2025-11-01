--
-- PostgreSQL database dump
--

\restrict QJUdA07OL9pzSgIwMMeTeQ9ArPlH93y6eCXxMpfpDh9ttTKeMHwozzELAcR2PPE

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    user_id integer,
    amount numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
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
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, user_id, amount, category, description, date, created_at, updated_at) FROM stdin;
1	6	50.00	Food	Lunch	2025-10-30	2025-11-01 08:54:18.466682	2025-11-01 08:54:18.466682
2	4	1340.00	Transport	To Tokyo	2025-10-30	2025-11-01 08:57:00.659426	2025-11-01 08:57:00.659426
3	4	1500.00	Entertainment	Go to cinema	2025-10-30	2025-11-01 08:58:02.81511	2025-11-01 08:58:02.81511
4	4	800.00	Entertainment	Go to picnic	2025-10-30	2025-11-01 09:01:42.720038	2025-11-01 09:01:42.720038
5	4	800.00	Transport	fly to Newyork	2025-10-30	2025-11-01 09:02:10.422165	2025-11-01 09:02:10.422165
6	4	4000.00	Food	Eating seafood	2025-10-30	2025-11-01 09:02:42.747046	2025-11-01 09:02:42.747046
7	4	4000.00	Food	Eating seafood	2025-08-30	2025-11-01 09:12:04.031807	2025-11-01 09:12:04.031807
8	4	4000.00	Food	Eating seafood	2025-04-30	2025-11-01 09:12:11.600347	2025-11-01 09:12:11.600347
9	4	4000.00	Transport	go to the zoo	2025-01-04	2025-11-01 09:12:31.459561	2025-11-01 09:12:31.459561
10	4	4000.00	Transport	go to the zoo	2025-01-04	2025-11-01 09:34:20.793601	2025-11-01 09:34:20.793601
11	1	230.00	Transport	go to the zoo	2025-01-04	2025-11-01 14:58:47.696656	2025-11-01 14:58:47.696656
12	1	5000.00	Entertainment	go to the zoo	2025-02-04	2025-11-01 14:59:47.033516	2025-11-01 14:59:47.033516
13	1	5000.00	Transport	go to the park	2025-03-04	2025-11-01 15:00:04.911024	2025-11-01 15:00:04.911024
14	1	690.00	Entertainment	listening music	2025-03-04	2025-11-01 15:00:23.229349	2025-11-01 15:00:23.229349
15	2	690.00	Entertainment	listening music	2025-03-04	2025-11-01 15:00:46.962844	2025-11-01 15:00:46.962844
16	2	9900.00	Food	Eating seafood	2025-03-04	2025-11-01 15:01:01.592233	2025-11-01 15:01:01.592233
17	3	9900.00	Food	Eating seafood	2025-03-04	2025-11-01 15:01:06.32968	2025-11-01 15:01:06.32968
18	3	9900.00	Transport	go to picnic	2025-03-04	2025-11-01 15:01:22.566757	2025-11-01 15:01:22.566757
19	3	9900.00	Transport	go to picnic	2025-06-04	2025-11-01 15:01:26.820873	2025-11-01 15:01:26.820873
20	3	800.00	Food	eating steak	2025-07-04	2025-11-01 15:01:49.50861	2025-11-01 15:01:49.50861
21	6	800.00	Food	eating steak	2025-07-04	2025-11-01 15:02:50.654867	2025-11-01 15:02:50.654867
22	6	1000.00	Entertainment	listening music	2025-07-04	2025-11-01 15:03:10.844294	2025-11-01 15:03:10.844294
23	6	1600.00	Transport	fly to America	2025-07-04	2025-11-01 15:03:30.354515	2025-11-01 15:03:30.354515
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, created_at, updated_at) FROM stdin;
1	John Doe	john.doe@example.com	2025-01-15 10:00:00	2025-01-15 10:00:00
2	Jane Smith	jane.smith@example.com	2025-02-01 14:30:00	2025-02-01 14:30:00
3	Michael Johnson	michael.j@example.com	2025-03-10 09:15:00	2025-03-10 09:15:00
4	Sarah Williams	sarah.w@example.com	2025-04-05 16:45:00	2025-04-05 16:45:00
5	David Brown	david.b@example.com	2025-05-20 11:20:00	2025-05-20 11:20:00
6	Tony	Tony@gmail.com	2025-11-01 08:43:31.372611	2025-11-01 08:43:31.372611
\.


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 23, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- Name: idx_expenses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QJUdA07OL9pzSgIwMMeTeQ9ArPlH93y6eCXxMpfpDh9ttTKeMHwozzELAcR2PPE

