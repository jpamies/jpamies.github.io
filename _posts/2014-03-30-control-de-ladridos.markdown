---
layout: post
title:  "Control de ladridos"
date:   2014-03-30 19:32:00
categories: IoT
tags: raspberryPi IoT DIY telegram xively
---

Hace ya tiempo me cambié de piso con Layla, la preciosidad que se puede ver en la foto :P, Apenas tenía 6-7 meses y el cambio de casa empezó a afectarle. Estaba más inquieta en casa y desarrolló una dependencia excesiva hacía mí. Esto provocó que en algunos momentos al salir de casa ladrara, y me generó bastantes problemas con algún vecino.

![Layla](/assets/posts/2014/03-30-layla.jpg)


Al poco tiempo pese a parecer controlar el tema sin haber molestado demasiado, siguieron más quejas de los ladridos, alguna vez con razón y la gran mayoría causadas por otros perros de la zona, por lo que ya no podía salir con tranquilidad a la calle :/

Primero instalé en mi iMac el iCamSource y compré su app en el AppleStore… durante un tiempo me conectaba a ver que hacía, pero perdía momentos y no podía asegurar que Layla no ladraba. Durante semanas me llamaba desde un teléfono de casa al móvil para poder escuchar los ruidos de casa en el trayecto al trabajo y una vez en el trabajo me ponía el iCam con auriculares mientras trabajaba… vaya palo ahora que lo pienso!!! xD

Durante este tiempo compré otra app, audioMemos, pero la verdad es que me funcionó sólo un par de veces. Se supone que guardaba el audio cuando detectaba ruido únicamente.. pero me grababa todas las horas sin parar.

Tenía una Raspberry Pi que me había comprado por Amazon hace algún tiempo, ahora la podéis comprar en tiendas normales de informática, y me decidí a buscar algún micro e intentar hacer lo mismo que el audioMemos pero que me pueda avisar por mail o por notificación al móvil.

Le puse a la raspberry Pi una webcam y después de pelearme para poder hacerla funcionar me puse con python a ver que tal iba el tema de la captura de audio y niveles de volumen. Sin mucha dificultad pude grabar en la SD el sonido de los momentos que detectaba un sonido superior a un nivel predefinido que después de ajustarlo era lo suficientemente alto como para evitar grabar al mínimo ruido.
Con esto ya tenía un registro de los momentos críticos, había bastantes falsos positivos pero no me importaba ya que los ladridos sí que los pillaba.
Después le añadí que reportara el nivel de sonido a xively, así poder ver la actividad para ver si es un ruido puntual o un ruido constante que puede ser Layla ladrando de forma continua.
Para rematarlo, le añadí el script de aviso por telegram a un grupo que hice para los ladridos de Laya ;), y con eso si tengo cobertura me envía un mensaje por telegram cada vez que graba un intervalo de sonido, con lo que tengo un histórico y un aviso al instante si no tengo cobertura. :P
