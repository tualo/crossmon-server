create table if not exists servers (
	id integer not null,
	name text not null,
	primary key (id)
);
create table if not exists programs (
	id integer not null,
	name text not null,
	primary key (id)
);
create table if not exists tags (
	id integer not null,
	name text not null,
	primary key (id)
);
create table if not exists data (
	server_id integer not null,
	program_id integer not null, 
	tag_id integer not null, 
	time bigint not null, 
	val fixed(16,5), 
	foreign key(server_id) references servers(id) on delete cascade,
	foreign key(program_id) references programs(id) on delete cascade,
	foreign key(tag_id) references tags(id) on delete cascade,
	
	primary key (server_id,program_id,tag_id,time) 
);

create index idx_data_program_id on data(program_id);
create index idx_data_server_id on data(server_id);
create index idx_data_tag_id on data(tag_id);

create table if not exists server_programs (
	server_id integer not null,
	program_id integer not null,
	primary key (server_id,program_id) 
);

create table if not exists server_programs_tags (
	server_id integer not null,
	program_id integer not null,
	tag_id integer not null,
	primary key (server_id,program_id,tag_id) 
);

create index idx_data_time on data(time);
