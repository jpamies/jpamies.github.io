---
layout: post
title:  "Instalar JIRA en Amazon AWS"
date:   2014-04-03 11:22:00
categories: OPS
tags: JIRA AWS EC2 Management Micro OPS
---

Tenía un post en Draft (desde Noviembre xD) para Instalar JIRA en Amazon usando una Micro, iba a borrarlo ya que fue un fiasco pero casi prefiero poner aquí mis conclusiones xD.

Instalar JIRA en una instancia micro para poder pagar sólo los 10$ una vez no vale la pena, hace falta mucha más máquina de lo que parece :/. Hay que pensar que las micro tiran mucho pero para pequeños intervalos de tiempo, a la que abusas Amazon empieza a robarte tiempo de CPU y la instancia se queda lela. (incluso aumentando timeouts como ponen algunos blogs, no se consigue un rendimiento aceptable)

La instalación de JIRA no tiene nada, JDK bajar JIRA y punto, no merece ni un post xD.

En la Admira íbamos a usar una instancia de Amazon para servir nuestro JIRA pero al final lo desestimamos y nos decidimos quedarnos en el OnDemand, que tampoco es que vuele ehh! xD
