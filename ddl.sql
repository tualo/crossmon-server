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