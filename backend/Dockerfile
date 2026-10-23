FROM python

WORKDIR /app/backend
# since this has been defined here we are now automatically in /app/backend and all commands will run here only 
COPY requirements.txt .
# hence above command COPY requirements.txt /app/backend will be chnaged
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y gcc libpq-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*                                       
    # copy pasted the run command always

RUN pip install psycopg2-binary
RUN pip install -r requirements.txt
COPY . /app/backend
CMD ["python","manage.py","runserver","0.0.0.0:8001"]

