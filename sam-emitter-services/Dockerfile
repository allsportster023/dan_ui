FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY * ./

RUN chmod 775 *

RUN mkdir /db

#ENTRYPOINT ["tail", "-f", "/dev/null"]
CMD ["python3", "sam_ingest_acft_sim.py"]